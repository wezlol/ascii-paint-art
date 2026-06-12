/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CanvasState, DrawingTool } from "../types";

interface DrawingCanvasProps {
  canvasState: CanvasState;
  onCellInteract: (x: number, y: number, mode: "hover" | "click") => void;
  activeTool: DrawingTool;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  fgColor: string;
  bgColor: string;
  currChar: string;
  previewOverlay: Record<string, string> | null; // coordinate map (e.g. "x,y" => char)
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  canvasState,
  onCellInteract,
  activeTool,
  isDrawing,
  setIsDrawing,
  fgColor,
  bgColor,
  currChar,
  previewOverlay,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  const { grid, width, height } = canvasState;

  const handleMouseDown = (x: number, y: number, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDrawing(true);
    onCellInteract(x, y, "click");
  };

  const handleMouseEnter = (x: number, y: number) => {
    setHoveredCell({ x, y });
    if (isDrawing) {
      onCellInteract(x, y, "click");
    } else {
      onCellInteract(x, y, "hover");
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
    if (!isDrawing) {
      onCellInteract(-1, -1, "hover"); // Clear preview overlay
    }
  };

  const handleGlobalMouseUp = () => {
    setIsDrawing(false);
  };

  React.useEffect(() => {
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  // Determine font size based on grid dimensions to ensure it fits perfectly on screen
  const getCellSizeClass = () => {
    if (width > 60) return "w-3 h-4 text-[9px]";
    if (width > 40) return "w-4 h-5 text-[11px]";
    return "w-5 h-6 text-sm";
  };

  const cellSizeClass = getCellSizeClass();

  return (
    <div className="flex flex-col items-center bg-stone-930 p-2 sm:p-4 rounded-xl border border-stone-800 shadow-2xl relative overflow-hidden">
      {/* CRT Scanline Scan aesthetic overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900/10 via-stone-950/40 to-stone-950/80 z-10" />
      
      {/* Control bar / Coordinates */}
      <div className="w-full flex justify-between items-center px-4 py-2 border-b border-stone-800 mb-3 text-xs text-stone-400 font-mono z-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-stone-300 font-medium tracking-wide">ACTIVE TERMINAL MATRIX</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Grid: <strong>{width}x{height}</strong></span>
          {hoveredCell ? (
            <span className="text-emerald-400">
              Cursor: <strong className="font-bold">X:{String(hoveredCell.x).padStart(2, '0')} Y:{String(hoveredCell.y).padStart(2, '0')}</strong>
            </span>
          ) : (
            <span className="text-stone-500">Cursor: --,--</span>
          )}
        </div>
      </div>

      {/* Grid Canvas Wrapper with responsive scrolling */}
      <div className="w-full overflow-auto max-h-[65vh] p-2 bg-stone-950 rounded border border-stone-900 shadow-inner custom-scrollbar relative z-20 flex justify-center">
        <div 
          className="flex flex-col gap-[1px] select-none cursor-crosshair bg-stone-900/60 p-[3px] rounded"
          style={{ width: "max-content" }}
        >
          {grid.map((row, y) => (
            <div key={y} className="flex gap-[1px]">
              {row.map((cell, x) => {
                const coordKey = `${x},${y}`;
                const hasOverlay = previewOverlay && previewOverlay[coordKey] !== undefined;
                const displayChar = hasOverlay ? previewOverlay[coordKey] : cell.char;
                const displayFg = hasOverlay ? fgColor : cell.fg;
                const displayBg = hasOverlay ? bgColor : cell.bg;

                const isHoveredCol = hoveredCell?.x === x;
                const isHoveredRow = hoveredCell?.y === y;
                const isExactHover = hoveredCell?.x === x && hoveredCell?.y === y;

                return (
                  <div
                    id={`cell-${x}-${y}`}
                    key={x}
                    onMouseDown={(e) => handleMouseDown(x, y, e)}
                    onMouseEnter={() => handleMouseEnter(x, y)}
                    onMouseLeave={handleMouseLeave}
                    className={`
                      ${cellSizeClass}
                      flex items-center justify-center font-mono transition-all duration-75 relative
                      ${isExactHover ? "ring-1 ring-emerald-400 z-30 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : ""}
                    `}
                    style={{
                      color: displayFg,
                      backgroundColor: displayBg,
                    }}
                  >
                    {/* Light grid cross-hair highlighting for vintage spreadsheet focus */}
                    {(isHoveredCol || isHoveredRow) && (
                      <div className="absolute inset-0 bg-stone-100/[0.03] pointer-events-none" />
                    )}
                    
                    {displayChar === " " ? "\u00A0" : displayChar}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Grid footer tools & helper */}
      <div className="w-full flex justify-between items-center mt-3 text-[11px] text-stone-500 font-mono px-2 z-20">
        <div className="flex gap-3">
          <span>Tool: <span className="text-stone-300 uppercase font-semibold">{activeTool}</span></span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Brush: <span className="text-stone-300 font-semibold">{currChar || "Space"}</span></span>
        </div>
        <div>
          <span>Click & Drag to Draw</span>
        </div>
      </div>
    </div>
  );
};
