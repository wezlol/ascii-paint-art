/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DrawingTool, PaletteColor } from "../types";
import { 
  Paintbrush, 
  Eraser, 
  PaintBucket, 
  Sparkles, 
  Maximize2, 
  Eye, 
  Info,
  ChevronRight,
  RotateCcw,
  Footprints,
  Maximize,
  PenTool,
  Grid3X3,
  Flame,
  MousePointerClick
} from "lucide-react";

interface DrawingControlsProps {
  activeTool: DrawingTool;
  setActiveTool: (tool: DrawingTool) => void;
  fgColor: string;
  setFgColor: (color: string) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  currChar: string;
  setCurrChar: (char: string) => void;
  onClear: () => void;
  onFloodAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  activePalette: PaletteColor[];
  onChangePalette: (paletteName: string) => void;
}

const PRESET_PALETTES = [
  { name: "Terminal CRT", key: "crt" },
  { name: "Cyberpunk Neon", key: "cyberpunk" },
  { name: "Gameboy Retro", key: "gameboy" },
  { name: "Vaporwave Retro", key: "vaporwave" },
  { name: "Autumn Forest", key: "autumn" },
  { name: "Chroma Pastel", key: "pastel" }
];

const QUICK_CHARS = [
  { name: "Solid Blocks", chars: ["█", "▓", "▒", "░", "\u00A0"] },
  { name: "Lines & Boxes", chars: ["═", "║", "╔", "╗", "╚", "╝", "╱", "╲", "╳", "━", "┃", "╬"] },
  { name: "Tech Symbols", chars: ["@", "#", "$", "%", "&", "*", "+", "x", "-", "=", ":", "."] },
  { name: "Braille Fine", chars: ["⣿", "⢿", "⠿", "⠟", "⠏", "⠇", "⠃", "⢀", "⡿", "⣻"] },
  { name: "Cosmic Shapes", chars: ["▲", "▼", "◄", "►", "■", "□", "▲", "●", "○", "♦", "♣", "♠", "♥"] }
];

export const DrawingControls: React.FC<DrawingControlsProps> = ({
  activeTool,
  setActiveTool,
  fgColor,
  setFgColor,
  bgColor,
  setBgColor,
  currChar,
  setCurrChar,
  onClear,
  onFloodAll,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  activePalette,
  onChangePalette,
}) => {
  const [customChar, setCustomChar] = React.useState("");

  const handleCustomCharSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customChar.length > 0) {
      setCurrChar(customChar[0]);
      setCustomChar("");
    }
  };

  const toolButtons = [
    { id: "pen", name: "Draw Pen", icon: Paintbrush, description: "Paint characters" },
    { id: "eraser", name: "Eraser", icon: Eraser, description: "Clear blocks" },
    { id: "fill", name: "Bucket Fill", icon: PaintBucket, description: "Flood fill connection" },
    { id: "shading", name: "Shader", icon: PenTool, description: "░ -> ▒ -> ▓ -> █ grad" },
    { id: "line", name: "Line Tool", icon: ChevronRight, description: "Draw perfect straight lines" },
    { id: "rect", name: "Box Frame", icon: Grid3X3, description: "Draw rectangle shapes" },
    { id: "circle", name: "Circle Ring", icon: Flame, description: "Draw ellipse outlines" },
  ] as const;

  return (
    <div className="flex flex-col gap-5 bg-stone-900 border border-stone-800 p-4 sm:p-5 rounded-xl shadow-lg font-sans">
      
      {/* Undo / Redo & Basic Canvas resets actions panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 p-2.5 rounded-lg border border-stone-800">
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
              canUndo 
                ? "bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700 active:scale-95" 
                : "bg-stone-900 text-stone-600 border-stone-800 cursor-not-allowed"
            }`}
          >
            ← Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
              canRedo 
                ? "bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700 active:scale-95" 
                : "bg-stone-900 text-stone-600 border-stone-800 cursor-not-allowed"
            }`}
          >
            Redo →
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onFloodAll}
            className="px-2.5 py-1.5 rounded text-[11px] font-mono font-semibold bg-stone-905 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800 hover:border-stone-700 transition-all active:scale-95"
            title="Fill entire screen with background color"
          >
            Canvas Fill
          </button>
          <button
            onClick={onClear}
            className="px-2.5 py-1.5 rounded text-[11px] font-mono font-semibold bg-rose-950/40 border border-rose-900/40 text-rose-300 hover:bg-rose-900/60 hover:text-white transition-all active:scale-95"
          >
            Clear Screen
          </button>
        </div>
      </div>

      {/* Toolbox Grid */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2.5 flex items-center gap-2">
          <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
          <span>Select active tool</span>
        </h3>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-2 gap-2">
          {toolButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = activeTool === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setActiveTool(btn.id)}
                className={`
                  flex items-center gap-2 p-2 rounded-lg border text-left transition-all relative group
                  ${isActive 
                    ? "bg-stone-840 border-emerald-500 text-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" 
                    : "bg-stone-950 hover:bg-stone-800 border-stone-800 text-stone-300"
                  }
                `}
                title={btn.description}
              >
                <div className={`p-1.5 rounded ${isActive ? "bg-emerald-500 text-stone-950" : "bg-stone-900 group-hover:bg-stone-700 text-stone-400"}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium font-mono tracking-tight leading-4">{btn.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Character Selector Banks */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2.5 flex items-center gap-1.5">
          <Footprints className="w-3.5 h-3.5 text-pink-400" />
          <span>Character selection Brush</span>
        </h3>
        <div className="flex flex-col gap-3.5">
          {QUICK_CHARS.map((group) => (
            <div key={group.name} className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500">{group.name}</span>
              <div className="flex flex-wrap gap-1">
                {group.chars.map((char) => {
                  const isSelected = currChar === char && activeTool !== 'eraser';
                  return (
                    <button
                      key={char}
                      onClick={() => {
                        setCurrChar(char);
                        if (activeTool === 'eraser') setActiveTool('pen');
                      }}
                      className={`
                        w-7 h-7 flex items-center justify-center font-mono rounded text-sm transition-all border
                        ${isSelected
                          ? "bg-pink-500 text-stone-950 border-pink-400 font-bold scale-110 shadow-md"
                          : "bg-stone-950 hover:bg-stone-800 border-stone-800 text-stone-200"
                        }
                      `}
                    >
                      {char === "\u00A0" ? "∅" : char}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Custom brush input builder */}
          <form onSubmit={handleCustomCharSubmit} className="flex gap-2">
            <input
              type="text"
              value={customChar}
              onChange={(e) => setCustomChar(e.target.value)}
              placeholder="Any glyph (e.g. ☣, ★, ✉, 😊)"
              maxLength={1}
              className="flex-1 bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-pink-500 font-sans font-medium"
            />
            <button
              type="submit"
              className="bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs px-3 rounded hover:border-pink-500/50 font-mono transition-colors"
            >
              Use
            </button>
          </form>
        </div>
      </div>

      {/* Color Swatch & Palette Pickers */}
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Style & Retro Palettes</span>
          </h3>
          <select
            onChange={(e) => onChangePalette(e.target.value)}
            className="bg-stone-950 border border-stone-800 text-stone-300 text-[10px] rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
          >
            {PRESET_PALETTES.map(p => (
              <option key={p.key} value={p.key}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Selected Swatches Preview */}
        <div className="grid grid-cols-2 gap-3 mb-3 bg-stone-950 p-2 rounded-lg border border-stone-800">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-stone-500 uppercase tracking-widest font-mono">Foreground</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor.startsWith("#") ? fgColor : "#FFFFFF"}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 outline-none"
              />
              <span className="text-[10px] font-mono font-semibold text-stone-200">{fgColor}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-stone-500 uppercase tracking-widest font-mono">Background</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor.startsWith("#") ? bgColor : "#000000"}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 outline-none"
              />
              <span className="text-[10px] font-mono font-semibold text-stone-200">{bgColor}</span>
            </div>
          </div>
        </div>

        {/* Color Palette List Selection grid */}
        <div className="flex flex-wrap gap-1.5">
          {activePalette.map((color, idx) => {
            const isFgSelected = fgColor.toLowerCase() === color.hex.toLowerCase();
            const isBgSelected = bgColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <div key={`${color.hex}-${idx}`} className="flex flex-col items-center gap-1 group relative">
                <button
                  onClick={() => setFgColor(color.hex)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setBgColor(color.hex);
                  }}
                  className={`
                    w-7 h-7 rounded relative border transition-all active:scale-90
                    ${isFgSelected ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-stone-900 scale-105 z-10" : "border-stone-800"}
                  `}
                  style={{ backgroundColor: color.hex }}
                  title={`${color.name} (Right-click for Background)`}
                >
                  {isBgSelected && (
                    <div className="absolute inset-1.5 rounded-full bg-stone-950 flex items-center justify-center text-[8px] font-bold text-white border border-stone-700">
                      B
                    </div>
                  )}
                </button>
                <span className="text-[8px] font-mono text-stone-500 truncate max-w-[28px] hidden sm:block">{color.name}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
