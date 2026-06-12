/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  CanvasState, 
  DrawingTool, 
  Cell, 
  SavedPainting, 
  PaletteColor 
} from "./types";
import { PRESETS } from "./assets/presets";
import { renderBannerText } from "./utils/banners";
import { DrawingCanvas } from "./components/DrawingCanvas";
import { 
  FileCode, 
  Layers, 
  Eye, 
  RotateCcw, 
  Sparkles, 
  Trash2, 
  Save, 
  FolderOpen, 
  Sliders, 
  Download, 
  Copy, 
  Upload, 
  HelpCircle,
  Command,
  Maximize2,
  RefreshCw,
  X,
  Palette,
  FileImage,
  MessageSquareCode
} from "lucide-react";

// Initializing retro palette groups
const PALETTE_COLORS: Record<string, PaletteColor[]> = {
  crt: [
    { name: "Terminal Green", hex: "#00FF41", accent: "Core" },
    { name: "Cyber Emerald", hex: "#10B981", accent: "Denser" },
    { name: "Lime Vapor", hex: "#84CC16", accent: "Highlight" },
    { name: "Amber Warning", hex: "#F59E0B", accent: "Alert" },
    { name: "Dark Moss", hex: "#064E3B", accent: "Shadow" },
    { name: "CRT Blue-Steel", hex: "#38BDF8", accent: "Interface" },
    { name: "Grid White", hex: "#F9FAFB", accent: "Bright" },
    { name: "Deep Void", hex: "#111827", accent: "Slick" },
  ],
  cyberpunk: [
    { name: "Grid Cyan", hex: "#00F0FF", accent: "Core" },
    { name: "Vapor Pink", hex: "#FF007F", accent: "Highlight" },
    { name: "Synth Purple", hex: "#BD00FF", accent: "Accent" },
    { name: "Chrome Gold", hex: "#FFF600", accent: "Flash" },
    { name: "Neon Orange", hex: "#FF8E00", accent: "Alert" },
    { name: "Hack Screen", hex: "#39FF14", accent: "Subtle" },
    { name: "Shattered Ice", hex: "#FFFFFF", accent: "Bright" },
    { name: "Night City", hex: "#03001e", accent: "Deep" },
  ],
  gameboy: [
    { name: "Classic Screen", hex: "#8bac0f", accent: "Dull" },
    { name: "Deep Charcoal", hex: "#306230", accent: "Heavy" },
    { name: "Minty Leaf", hex: "#9bbc0f", accent: "Medium" },
    { name: "Tint Gray", hex: "#a4b500", accent: "Tint" },
    { name: "Retro Screen", hex: "#cadc9f", accent: "Light" },
    { name: "Game Line", hex: "#0f380f", accent: "Outline" },
    { name: "Shadow Moss", hex: "#1e371a", accent: "Accent" },
    { name: "Solder Lead", hex: "#9ca3af", accent: "Brightest" }
  ],
  vaporwave: [
    { name: "Sunset Fuchsia", hex: "#FF71CE", accent: "Main" },
    { name: "Cyber Teal", hex: "#01CDFE", accent: "Bright" },
    { name: "Arcade Green", hex: "#05FFA1", accent: "Neon" },
    { name: "Viper Indigo", hex: "#B967FF", accent: "Soft" },
    { name: "Retro Lemon", hex: "#FFFB96", accent: "Vibe" },
    { name: "Dream Pink", hex: "#FFDEE9", accent: "Pastel" },
    { name: "Plaza Violet", hex: "#2A0845", accent: "Deep" },
    { name: "Miami Night", hex: "#0b001a", accent: "Shadow" }
  ],
  autumn: [
    { name: "Woodland Bark", hex: "#78350F", accent: "Deep" },
    { name: "Amber Ash", hex: "#EA580C", accent: "Warm" },
    { name: "Forest Olive", hex: "#3F6212", accent: "Leaves" },
    { name: "Rust Red", hex: "#9A3412", accent: "Spiced" },
    { name: "Sunset Gold", hex: "#EAB308", accent: "High" },
    { name: "Beige Meadow", hex: "#FFFBEB", accent: "Glow" },
    { name: "Autumn Fog", hex: "#6B7280", accent: "Sky" },
    { name: "Earth Mud", hex: "#451a03", accent: "Soil" }
  ],
  pastel: [
    { name: "Pink Cloud", hex: "#FBCFE8", accent: "Soft" },
    { name: "Mint Foam", hex: "#A7F3D0", accent: "Flora" },
    { name: "Lavender Glow", hex: "#E9D5FF", accent: "Dream" },
    { name: "Glaze Blue", hex: "#BAE6FD", accent: "Sky" },
    { name: "Apricot Soda", hex: "#FFEDD5", accent: "Core" },
    { name: "Soft Custard", hex: "#FEF08A", accent: "Bright" },
    { name: "Slate Mist", hex: "#E5E7EB", accent: "Canvas" },
    { name: "Plaza Onyx", hex: "#1F2937", accent: "Dull" }
  ]
};

const BRUSH_BANKS = [
  { 
    name: "Volumetric Blocks", 
    chars: ["█", "▓", "▒", "░", "▌", "▐", "▀", "▄", "■", " "] 
  },
  { 
    name: "Cyber & Grid Lines", 
    chars: ["═", "║", "╔", "╗", "╚", "╝", "╱", "╲", "╳", "━", "┃", "╬", "░"] 
  },
  { 
    name: "Industrial Chars", 
    chars: ["@", "#", "$", "%", "&", "*", "+", "-", "=", ":", ".", "/", "☣", "☢"] 
  },
  { 
    name: "Fine Braille Pattern", 
    chars: ["⣿", "⢿", "⠿", "⠟", "⠏", "⠇", "⠃", "⢀", "⡿", "⣻", "⢵", "⠢"] 
  },
  { 
    name: "Cosmic Glyphs", 
    chars: ["▲", "▼", "◄", "►", "■", "□", "●", "○", "♦", "♣", "♠", "♥", "★", "✉"] 
  }
];

export default function App() {
  // Core Drawing Canvas States
  const [width, setWidth] = useState<number>(60);
  const [height, setHeight] = useState<number>(30);
  const [grid, setGrid] = useState<Cell[][]>([]);
  
  // Brush Tools & Configuration
  const [activeTool, setActiveTool] = useState<DrawingTool>("pen");
  const [fgColor, setFgColor] = useState<string>("#00FF41");
  const [bgColor, setBgColor] = useState<string>("#000000");
  const [currChar, setCurrChar] = useState<string>("█");
  const [selectedPaletteKey, setSelectedPaletteKey] = useState<string>("crt");
  const [activePalette, setActivePalette] = useState<PaletteColor[]>(PALETTE_COLORS.crt);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Transient path overlays for shapes dragging (Line, Rectangle, Circle)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [previewOverlay, setPreviewOverlay] = useState<Record<string, string> | null>(null);

  // Undo / Redo stacks
  const [history, setHistory] = useState<Cell[][][]>([]);
  const [redoHistory, setRedoHistory] = useState<Cell[][][]>([]);
  const [strokeStartGrid, setStrokeStartGrid] = useState<Cell[][] | null>(null);

  // Side Tab and Dashboard configuration
  const [activeSidebarTab, setActiveSidebarTab] = useState<"brush" | "generator" | "converter" | "library">("brush");
  const [showScanlines, setShowScanlines] = useState<boolean>(true);
  const [showCoordinateGuide, setShowCoordinateGuide] = useState<boolean>(true);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  
  // Custom Alerts / Modal dialogs instead of window.alert
  const [customToast, setCustomToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [savePaintingName, setSavePaintingName] = useState<string>("");
  const [savedPaintings, setSavedPaintings] = useState<SavedPainting[]>([]);

  // Artificial Session timer run
  const [sessionTime, setSessionTime] = useState<string>("00:00:00");
  const sessionStartRef = useRef<number>(Date.now());

  // NFO Export state parameters
  const [nfoModalOpen, setNfoModalOpen] = useState<boolean>(false);
  const [nfoEncoding, setNfoEncoding] = useState<"utf8" | "cp437">("cp437");
  const [nfoIncludeHeader, setNfoIncludeHeader] = useState<boolean>(true);
  const [nfoArtist, setNfoArtist] = useState<string>("wez");
  const [nfoGroup, setNfoGroup] = useState<string>("DEMO_COUNCIL");
  const [nfoTitle, setNfoTitle] = useState<string>("canvas-art");

  // Input bindings
  // AI generators
  const [generatorPrompt, setGeneratorPrompt] = useState<string>("");
  const [generatorStyle, setGeneratorStyle] = useState<string>("blocks");
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  // Suggested palette
  const [palettePrompt, setPalettePrompt] = useState<string>("");
  const [paletteAdvice, setPaletteAdvice] = useState<string>("");
  const [isGettingSuggestions, setIsGettingSuggestions] = useState<boolean>(false);

  // Custom text banners
  const [bannerString, setBannerString] = useState<string>("RETRO");
  const [bannerX, setBannerX] = useState<number>(4);
  const [bannerY, setBannerY] = useState<number>(10);

  // Custom resizing form state
  const [newWidthInput, setNewWidthInput] = useState<string>("60");
  const [newHeightInput, setNewHeightInput] = useState<string>("30");

  // Telemetry attributes for bottom layout
  const [hoveredCoordinate, setHoveredCoordinate] = useState<{ x: number; y: number } | null>(null);

  // Toast auto-clear timer
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setCustomToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setCustomToast(null);
    }, 5000);
  };

  // Build an empty grid
  const createEmptyGrid = (w: number, h: number, fg = "#00FF41", bg = "#000000"): Cell[][] => {
    return Array.from({ length: h }, () =>
      Array.from({ length: w }, () => ({
        char: " ",
        fg,
        bg
      }))
    );
  };

  // Init grid on spawn
  useEffect(() => {
    const freshGrid = createEmptyGrid(width, height, fgColor, bgColor);
    // Populate an initial decorative "Welcome" banner so the grid is not completely blank!
    setGrid(freshGrid);
    
    // Setup background Session timer
    const interval = setInterval(() => {
      const diffMs = Date.now() - sessionStartRef.current;
      const secs = Math.floor(diffMs / 1000) % 60;
      const mins = Math.floor(diffMs / (1000 * 60)) % 60;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      setSessionTime(
        `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
    }, 1000);

    // Initial LocalStorage read for Saved drawings library
    try {
      const saved = localStorage.getItem("ascii_paint_drawings");
      if (saved) {
        setSavedPaintings(JSON.parse(saved));
      }
    } catch (_) {}

    return () => clearInterval(interval);
  }, []);

  // Sync palette key
  const handlePaletteKeyChange = (key: string) => {
    setSelectedPaletteKey(key);
    if (PALETTE_COLORS[key]) {
      setActivePalette(PALETTE_COLORS[key]);
      // Auto assign core color of style as foreground
      setFgColor(PALETTE_COLORS[key][0].hex);
    }
  };

  // Committing history snapshot
  const registerNewGridState = (newGrid: Cell[][]) => {
    setHistory(prev => [...prev.slice(-40), JSON.parse(JSON.stringify(grid))]);
    setRedoHistory([]);
    setGrid(newGrid);
  };

  // Resize canvas safely
  const handleResizeGrid = (newW: number, newH: number) => {
    if (newW < 5 || newW > 120 || newH < 5 || newH > 80) {
      showToast("Grid dimensions must be between 5 and 120 (cols), and 5 and 80 (rows).", "error");
      return;
    }
    
    const resizedGrid = createEmptyGrid(newW, newH, fgColor, bgColor);
    // Overlay whatever parts fit from old grid
    for (let r = 0; r < Math.min(newH, height); r++) {
      for (let c = 0; c < Math.min(newW, width); c++) {
        if (grid[r] && grid[r][c]) {
          resizedGrid[r][c] = { ...grid[r][c] };
        }
      }
    }
    
    setHistory(prev => [...prev.slice(-40), JSON.parse(JSON.stringify(grid))]);
    setRedoHistory([]);
    setWidth(newW);
    setHeight(newH);
    setGrid(resizedGrid);
    showToast(`Matrix resized to grid bounds ${newW}x${newH}!`, "success");
  };

  // Fill Flood logic
  const performFloodFill = (startX: number, startY: number) => {
    const newGrid = JSON.parse(JSON.stringify(grid));
    const startCell = grid[startY][startX];
    const matchChar = startCell.char;
    const matchFg = startCell.fg;
    const matchBg = startCell.bg;

    // Avoid infinite run if cell already matches selection
    if (matchChar === currChar && matchFg === fgColor && matchBg === bgColor) return;

    const queue: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      const key = `${cx},${cy}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
      const cell = newGrid[cy][cx];
      if (cell.char === matchChar && cell.fg === matchFg && cell.bg === matchBg) {
        cell.char = currChar;
        cell.fg = fgColor;
        cell.bg = bgColor;

        queue.push([cx + 1, cy]);
        queue.push([cx - 1, cy]);
        queue.push([cx, cy + 1]);
        queue.push([cx, cy - 1]);
      }
    }
    registerNewGridState(newGrid);
  };

  // Bresenham's algorithms
  const getLineCells = (x0: number, y0: number, x1: number, y1: number) => {
    const list: { x: number; y: number }[] = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let cx = x0;
    let cy = y0;
    while (true) {
      list.push({ x: cx, y: cy });
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
    return list;
  };

  const getRectCells = (x0: number, y0: number, x1: number, y1: number) => {
    const list: { x: number; y: number }[] = [];
    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);

    for (let r = minY; r <= maxY; r++) {
      for (let c = minX; c <= maxX; c++) {
        // Draw frame boundaries
        if (r === minY || r === maxY || c === minX || c === maxX) {
          list.push({ x: c, y: r });
        }
      }
    }
    return list;
  };

  const getCircleCells = (xc: number, yc: number, x1: number, y1: number) => {
    const rx = Math.abs(x1 - xc);
    const ry = Math.abs(y1 - yc);
    const list: { x: number; y: number }[] = [];
    if (rx === 0 && ry === 0) return [{ x: xc, y: yc }];

    // Circular angle increments
    const steps = 0.01;
    for (let a = 0; a < 2 * Math.PI; a += steps) {
      const px = Math.round(xc + rx * Math.cos(a));
      const py = Math.round(yc + ry * Math.sin(a));
      list.push({ x: px, y: py });
    }

    // De-duplicate computed cells to make rendering efficient
    const set = new Set<string>();
    const uniq: { x: number; y: number }[] = [];
    for (const c of list) {
      const key = `${c.x},${c.y}`;
      if (!set.has(key)) {
        set.add(key);
        uniq.push(c);
      }
    }
    return uniq;
  };

  // Get Shading Cycle character
  const getShadedChar = (current: string) => {
    const cycle = [" ", "░", "▒", "▓", "█"];
    const base = current === "\u00A0" || current === " " ? " " : current;
    const idx = cycle.indexOf(base);
    if (idx === -1) return "░"; // If custom symbol, start at light shading
    return cycle[(idx + 1) % cycle.length];
  };

  // Core drawing and coordinate interact
  const onCellInteract = (cx: number, cy: number, mode: "hover" | "click") => {
    if (cx < 0 || cx >= width || cy < 0 || cy >= height) {
      setHoveredCoordinate(null);
      if (mode === "hover" && !isDrawing) {
        setPreviewOverlay(null);
      }
      return;
    }

    setHoveredCoordinate({ x: cx, y: cy });

    if (mode === "click") {
      // Stroke capture starting step
      if (!strokeStartGrid) {
        setStrokeStartGrid(JSON.parse(JSON.stringify(grid)));
      }

      // Action routing
      if (activeTool === "pen") {
        const updated = [...grid];
        updated[cy][cx] = { char: currChar, fg: fgColor, bg: bgColor };
        setGrid(updated);
      } else if (activeTool === "eraser") {
        const updated = [...grid];
        updated[cy][cx] = { char: " ", fg: "#2A2A2A", bg: bgColor };
        setGrid(updated);
      } else if (activeTool === "shading") {
        const updated = [...grid];
        const nextChar = getShadedChar(grid[cy][cx].char);
        updated[cy][cx] = { char: nextChar, fg: fgColor, bg: bgColor };
        setGrid(updated);
      } else if (activeTool === "fill") {
        performFloodFill(cx, cy);
        setStrokeStartGrid(null); // flood is instant, no dragging
      } else if (["line", "rect", "circle"].includes(activeTool)) {
        if (!startPoint) {
          setStartPoint({ x: cx, y: cy });
          setCurrentPoint({ x: cx, y: cy });
        } else {
          setCurrentPoint({ x: cx, y: cy });
          // Compute real-time drag preview overlay
          const preview = buildPreviewMap(startPoint.x, startPoint.y, cx, cy, activeTool);
          setPreviewOverlay(preview);
        }
      }
    } else if (mode === "hover") {
      if (isDrawing && ["line", "rect", "circle"].includes(activeTool) && startPoint) {
        setCurrentPoint({ x: cx, y: cy });
        const preview = buildPreviewMap(startPoint.x, startPoint.y, cx, cy, activeTool);
        setPreviewOverlay(preview);
      } else if (!isDrawing) {
        // Simple light preview of brush character
        if (activeTool === "pen") {
          setPreviewOverlay({ [`${cx},${cy}`]: currChar });
        } else if (activeTool === "eraser") {
          setPreviewOverlay({ [`${cx},${cy}`]: "∅" });
        } else {
          setPreviewOverlay(null);
        }
      }
    }
  };

  // Build key-val format coordinates map for live brush drawing preview overlay
  const buildPreviewMap = (x0: number, y0: number, x1: number, y1: number, tool: string): Record<string, string> => {
    const map: Record<string, string> = {};
    const brush = activeTool === "eraser" ? " " : currChar;
    
    if (tool === "line") {
      getLineCells(x0, y0, x1, y1).forEach(c => {
        if (c.x >= 0 && c.x < width && c.y >= 0 && c.y < height) {
          map[`${c.x},${c.y}`] = brush;
        }
      });
    } else if (tool === "rect") {
      getRectCells(x0, y0, x1, y1).forEach(c => {
        if (c.x >= 0 && c.x < width && c.y >= 0 && c.y < height) {
          map[`${c.x},${c.y}`] = brush;
        }
      });
    } else if (tool === "circle") {
      getCircleCells(x0, y0, x1, y1).forEach(c => {
        if (c.x >= 0 && c.x < width && c.y >= 0 && c.y < height) {
          map[`${c.x},${c.y}`] = brush;
        }
      });
    }
    return map;
  };

  // Bind key handlers to mouse up for shapes drawing commitment
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDrawing(false);
      
      // If a drag-path shape was active, burn it permanently
      if (["line", "rect", "circle"].includes(activeTool) && startPoint && currentPoint && previewOverlay) {
        const mergedGrid = JSON.parse(JSON.stringify(grid));
        const color = activeTool === "eraser" ? "#2A2A2A" : fgColor;
        const bg = bgColor;

        Object.entries(previewOverlay).forEach(([coords, char]) => {
          const [cx, cy] = coords.split(",").map(Number);
          if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
            mergedGrid[cy][cx] = { char, fg: color, bg };
          }
        });

        // Register history correctly using the stored pre-stroke grid state
        if (strokeStartGrid) {
          setHistory(prev => [...prev.slice(-40), strokeStartGrid]);
          setRedoHistory([]);
        }
        setGrid(mergedGrid);
        showToast(`Painted outline using ${activeTool} tool!`, "success");
      } else if (strokeStartGrid) {
        // It was a pen/eraser outline stroke, push the pre-stroke snapshot to history
        setHistory(prev => [...prev.slice(-40), strokeStartGrid]);
        setRedoHistory([]);
      }

      // Reset coordinates
      setStartPoint(null);
      setCurrentPoint(null);
      setPreviewOverlay(null);
      setStrokeStartGrid(null);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [grid, activeTool, startPoint, currentPoint, previewOverlay, strokeStartGrid, fgColor, bgColor, currChar]);

  // Undo / Redo helpers
  const handleUndo = () => {
    if (history.length === 0) {
      showToast("No action to undo.", "info");
      return;
    }
    const currentClone = JSON.parse(JSON.stringify(grid));
    setRedoHistory(prev => [currentClone, ...prev]);
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));
    setGrid(previous);
    showToast("Action undone.", "info");
  };

  const handleRedo = () => {
    if (redoHistory.length === 0) {
      showToast("No action to redo.", "info");
      return;
    }
    const next = redoHistory[0];
    setRedoHistory(prev => prev.slice(1));
    const currentClone = JSON.parse(JSON.stringify(grid));
    setHistory(prev => [...prev, currentClone]);
    setGrid(next);
    showToast("Action redone.", "info");
  };

  // Clear or Flood commands
  const handleClearMatrix = () => {
    const cleared = createEmptyGrid(width, height, fgColor, bgColor);
    registerNewGridState(cleared);
    showToast("Matrix grid cleared completely.", "info");
  };

  const handleFloodAll = () => {
    const flooded = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => ({
        char: currChar,
        fg: fgColor,
        bg: bgColor
      }))
    );
    registerNewGridState(flooded);
    showToast("Grid completely flooded with selected brush & color keys.", "success");
  };

  // Banner stamp function
  const handleStampBannerText = () => {
    if (!bannerString) {
      showToast("Please enter text for the banner.", "error");
      return;
    }
    const lines = renderBannerText(bannerString);
    const bannerH = lines.length;
    const bannerW = lines[0]?.length || 0;

    const stampedGrid = JSON.parse(JSON.stringify(grid));
    let written = 0;

    for (let r = 0; r < bannerH; r++) {
      const curY = bannerY + r;
      if (curY < 0 || curY >= height) continue;

      const rowText = lines[r];
      for (let c = 0; c < rowText.length; c++) {
        const curX = bannerX + c;
        if (curX < 0 || curX >= width) continue;

        const char = rowText[c];
        // Ensure we draw non-empty or styled blocks
        if (char !== " ") {
          stampedGrid[curY][curX] = {
            char,
            fg: fgColor,
            bg: bgColor
          };
          written++;
        }
      }
    }

    if (written > 0) {
      registerNewGridState(stampedGrid);
      showToast(`Stamped text banner "${bannerString}" at X:${bannerX} Y:${bannerY}!`, "success");
    } else {
      showToast("Clipped off grid parameters completely! Adjust X & Y coordinates.", "error");
    }
  };

  // Convert uploaded image to ASCII characters with full high density canvas colors
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (re) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext("2d");
        if (!ctx) return;

        // Draw and squeeze
        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        const asciiGrid = createEmptyGrid(width, height, fgColor, bgColor);
        // Choice luminance blocks mapping
        const densityChars = [" ", "░", "▒", "▓", "█"];
        const charsLength = densityChars.length;

        for (let r = 0; r < height; r++) {
          for (let c = 0; c < width; c++) {
            const idx = (r * width + c) * 4;
            const red = data[idx];
            const green = data[idx + 1];
            const blue = data[idx + 2];
            const alpha = data[idx + 3];

            if (alpha < 15) {
              asciiGrid[r][c] = { char: " ", fg: fgColor, bg: bgColor };
              continue;
            }

            const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;
            const charIdx = Math.floor((luminance / 255) * (charsLength - 1));
            const charVal = densityChars[charIdx] || " ";

            // Set foreground custom RGBA hex color
            const customHex = "#" + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);

            asciiGrid[r][c] = {
              char: charVal,
              fg: customHex,
              bg: bgColor
            };
          }
        }

        registerNewGridState(asciiGrid);
        showToast("Photo successfully translated to ASCII grid Matrix!", "success");
      };
      img.src = re.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // AI-guided ASCII drawing generation
  const handleGenerateAIScene = async () => {
    if (!generatorPrompt.trim()) {
      showToast("Please enter a concept prompt first.", "error");
      return;
    }
    setIsGeneratingAI(true);
    showToast("Contacting Gemini neural engine... Please stand by.", "info");

    try {
      const res = await fetch("/api/generate-ascii", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: generatorPrompt,
          width,
          height,
          style: generatorStyle
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed server retrieval");
      }

      const data = await res.json();
      if (!data.grid || !Array.isArray(data.grid)) {
        throw new Error("Invalid output layout from AI server.");
      }

      const generatedGrid = createEmptyGrid(width, height, fgColor, bgColor);
      const rowCount = Math.min(height, data.grid.length);

      for (let r = 0; r < rowCount; r++) {
        const rowStr = data.grid[r] || "";
        const colCount = Math.min(width, rowStr.length);
        for (let c = 0; c < colCount; c++) {
          const ch = rowStr[c];
          // Burn AI letters directly into grid coordinates with green phosphor tint
          generatedGrid[r][c] = {
            char: ch,
            fg: fgColor,
            bg: bgColor
          };
        }
      }

      registerNewGridState(generatedGrid);
      showToast(`AI ASCII synthesis completed for: "${generatorPrompt}"`, "success");
    } catch (e: any) {
      console.error(e);
      showToast(`AI Generation Error: ${e.message}`, "error");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // AI design advice & color suggestions query
  const handleSuggestPalette = async () => {
    if (!palettePrompt.trim()) {
      showToast("Please describe the scene theme first.", "error");
      return;
    }
    setIsGettingSuggestions(true);
    showToast("Analyzing theme with Gemini to generate retro colors...", "info");

    try {
      const res = await fetch("/api/suggest-palette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: palettePrompt })
      });

      if (!res.ok) {
        throw new Error("Failed connecting to suggestions server.");
      }

      const data = await res.json();
      if (data.colors && Array.isArray(data.colors)) {
        // Build customized suggested palette additions
        const customPalette: PaletteColor[] = data.colors.map((c: any) => ({
          name: c.name || "AI Suggested",
          hex: c.hex || "#FFFFFF",
          accent: c.accent || "Accent"
        }));
        
        setActivePalette(customPalette);
        setFgColor(customPalette[0]?.hex || fgColor);
        setPaletteAdvice(data.tip || "Draw clean high contrast outlines!");
        showToast("AI Custom Retro Palette applied successfully!", "success");
      }
    } catch (e: any) {
      console.error(e);
      showToast("Failed to fetch design advice coordinates.", "error");
    } finally {
      setIsGettingSuggestions(false);
    }
  };

  // Save drawing into internal vault database
  const handleSaveToVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!savePaintingName.trim()) {
      showToast("Please provide a name to save this painting.", "error");
      return;
    }

    try {
      const list: SavedPainting[] = JSON.parse(localStorage.getItem("ascii_paint_drawings") || "[]");
      const savedItem: SavedPainting = {
        id: "saved_" + Date.now(),
        name: savePaintingName.trim(),
        createdAt: new Date().toLocaleDateString() + " @ " + new Date().toLocaleTimeString(),
        state: {
          width,
          height,
          grid
        }
      };

      list.push(savedItem);
      localStorage.setItem("ascii_paint_drawings", JSON.stringify(list));
      setSavedPaintings(list);
      setSaveModalOpen(false);
      setSavePaintingName("");
      showToast(`Saved "${savedItem.name}" to vault library!`, "success");
    } catch (err) {
      showToast("Failed saving drawing data locally.", "error");
    }
  };

  // Delete saved drawings
  const handleDeleteSavedItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedPaintings.filter(item => item.id !== id);
    localStorage.setItem("ascii_paint_drawings", JSON.stringify(filtered));
    setSavedPaintings(filtered);
    showToast("Drawing deleted from list.", "info");
  };

  // Load saved drawing back into canvas
  const handleLoadSavedItem = (item: SavedPainting) => {
    if (!item.state || !item.state.grid) {
      showToast("Corrupted painting state found.", "error");
      return;
    }
    setHistory(prev => [...prev.slice(-40), JSON.parse(JSON.stringify(grid))]);
    setRedoHistory([]);
    setWidth(item.state.width);
    setHeight(item.state.height);
    setGrid(item.state.grid);
    showToast(`Loaded "${item.name}" from local vault.`, "success");
  };

  // Load presets from static database
  const handleLoadPreset = (presetId: string) => {
    const p = PRESETS.find(item => item.id === presetId);
    if (!p) return;

    const presetFg = p.fgDefault || fgColor;
    const presetBg = p.bgDefault || bgColor;
    const presetGrid = createEmptyGrid(p.width, p.height, presetFg, presetBg);

    for (let r = 0; r < p.height; r++) {
      const rowString = p.grid[r] || "";
      for (let c = 0; c < p.width; c++) {
        const symbol = rowString[c] || " ";
        presetGrid[r][c] = {
          char: symbol,
          fg: presetFg,
          bg: presetBg
        };
      }
    }

    setHistory(prev => [...prev.slice(-40), JSON.parse(JSON.stringify(grid))]);
    setRedoHistory([]);
    setWidth(p.width);
    setHeight(p.height);
    setGrid(presetGrid);
    showToast(`Preset "${p.name}" successfully active.`, "success");
  };

  // Export options: Clipboard, Plaintext downloads, raw JSON file download
  const getRawTxtContent = () => {
    return grid.map(row => row.map(cell => cell.char).join("")).join("\n");
  };

  const handleCopyToClipboard = () => {
    const text = getRawTxtContent();
    navigator.clipboard.writeText(text)
      .then(() => showToast("Copied raw ASCII text to clipboard!", "success"))
      .catch(() => showToast("Failed to copy text.", "error"));
  };

  const handleDownloadTxt = () => {
    const text = getRawTxtContent();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ascii-painting-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Plaintext ASCII file downloaded!", "success");
  };

  const handleDownloadJson = () => {
    const filePayload = {
      matrix: "ASCII_STUDIO",
      width,
      height,
      canvas: grid.map(row => 
        row.map(cell => ({
          char: cell.char,
          fg: cell.fg,
          bg: cell.bg
        }))
      )
    };
    const blob = new Blob([JSON.stringify(filePayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ascii-matrix-pack-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("JSON matrix project config downloaded!", "success");
  };

  const convertToCP437Bytes = (text: string): Uint8Array => {
    const UNICODE_TO_CP437: Record<string, number> = {
      ' ': 0x20,
      '\u00A0': 0x20,
      '░': 0xB0,
      '▒': 0xB1,
      '▓': 0xB2,
      '█': 0xDB,
      '▄': 0xDC,
      '▌': 0xDD,
      '▐': 0xDE,
      '▀': 0xDF,
      '■': 0xFE,
      '─': 0xC4, '━': 0xC4,
      '│': 0xB3, '┃': 0xB3,
      '┌': 0xDA,
      '┐': 0xBF,
      '└': 0xC0,
      '┘': 0xD9,
      '├': 0xC3, '┤': 0xB4,
      '┬': 0xC2, '┴': 0xC1,
      '┼': 0xC5,
      '═': 0xCD,
      '║': 0xBA,
      '╔': 0xC9,
      '╗': 0xBB,
      '╚': 0xC8,
      '╝': 0xBC,
      '╠': 0xCC, '╣': 0xB9,
      '╦': 0xCB, '╩': 0xCA,
      '╬': 0xCE,
      '╱': 0x2F,
      '╲': 0x5C,
      '╳': 0x58,
      '▲': 0x1E, '▼': 0x1F,
      '◄': 0x11, '►': 0x10,
      '●': 0x09, '○': 0x09,
      '♦': 0x04, '♣': 0x05, '♠': 0x06, '♥': 0x03,
    };

    const bytes: number[] = [];
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '\n') {
        bytes.push(0x0D, 0x0A);
      } else if (UNICODE_TO_CP437[char] !== undefined) {
        bytes.push(UNICODE_TO_CP437[char]);
      } else {
        const code = char.charCodeAt(0);
        if (code < 128) {
          bytes.push(code);
        } else {
          bytes.push(0x3F);
        }
      }
    }
    return new Uint8Array(bytes);
  };

  const generateNfoText = () => {
    let headerText = "";
    if (nfoIncludeHeader) {
      const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
      headerText = 
`╔══════════════════════════════════════════════════════╗
║ ASCII STUDIO v2.5 OFFICIAL NFO RELEASE FILE          ║
╠══════════════════════════════════════════════════════╣
║ ARTIST NAME....: ${nfoArtist.padEnd(35)} ║
║ GROUP/CREW.....: ${nfoGroup.padEnd(35)} ║
║ ARTWORK TITLE..: ${nfoTitle.padEnd(35)} ║
║ VERSION/DATE...: ${dateStr.padEnd(35)} ║
║ RESOLUTION.....: ${(width + "x" + height).padEnd(35)} ║
╚══════════════════════════════════════════════════════╝

`;
    }
    const canvasText = getRawTxtContent();
    return headerText + canvasText;
  };

  const handleDownloadNfo = () => {
    const textContent = generateNfoText();
    let blob: Blob;

    if (nfoEncoding === "cp437") {
      const bytes = convertToCP437Bytes(textContent);
      blob = new Blob([bytes], { type: "application/octet-stream" });
    } else {
      blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanTitle = nfoTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") || "release";
    link.download = `${cleanTitle}.nfo`;
    link.click();
    URL.revokeObjectURL(url);
    setNfoModalOpen(false);
    showToast(`Successfully exported and saved ${cleanTitle}.nfo (${nfoEncoding.toUpperCase()})!`, "success");
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0D0D0D] text-gray-300 font-mono text-[11px] overflow-hidden select-none relative crt-monitor">
      
      {/* Dynamic Scanlines Overlay for authentic retro-CRT glowing screen depth */}
      {showScanlines && (
        <div className="absolute inset-0 pointer-events-none scanline-overlay z-40" />
      )}

      {/* Retro Alert Floating Banner for custom toasts */}
      {customToast && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 border bg-[#141414] shadow-2xl rounded text-xs transition-all pointer-events-auto max-w-md animate-bounce"
          style={{
            borderColor: customToast.type === "success" ? "#00FF41" : customToast.type === "error" ? "#FF007F" : "#38BDF8",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded" 
              style={{
                backgroundColor: customToast.type === "success" ? "#00FF41" : customToast.type === "error" ? "#FF007F" : "#38BDF8"
              }}
            />
            <span className="font-bold tracking-wider text-stone-200">
              {customToast.type.toUpperCase()}:
            </span>
            <span className="text-gray-300">{customToast.message}</span>
          </div>
          <button 
            onClick={() => setCustomToast(null)}
            className="text-stone-500 hover:text-stone-200 transition-colors ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Navigation matching industrial setup instructions */}
      <header className="h-10 border-b border-[#2A2A2A] flex items-center px-4 justify-between bg-[#141414] relative z-20 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-[#00FF41] rounded-sm animate-pulse" />
            <span className="font-bold text-white tracking-widest uppercase">ASCII_STUDIO v2.5</span>
          </div>
          
          <nav className="hidden md:flex space-x-4 text-gray-500 uppercase tracking-tighter text-[10px]">
            <span className="hover:text-white cursor-pointer" onClick={() => setShowHelpModal(true)}>Help_Index</span>
            <span className="hover:text-white cursor-pointer" onClick={handleClearMatrix}>Reset_Canvas</span>
            <span className="hover:text-white cursor-pointer" onClick={() => handleResizeGrid(60, 30)}>Reset_60x30</span>
            <span className="hover:text-white cursor-pointer" onClick={() => handleResizeGrid(80, 40)}>Reset_80x40</span>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-[#00FF41] text-[10px] hidden xs:inline tracking-widest crt-glow">
            CRT_MATRIX ... [{sessionTime}]
          </span>
          <div className="flex gap-1.5">
            <button 
              onClick={handleCopyToClipboard}
              className="px-2 py-1 bg-[#1A1A1A] hover:bg-white hover:text-black border border-[#2A2A2A] text-[10px] uppercase font-mono tracking-tight transition-colors flex items-center gap-1 cursor-pointer"
              title="Copy row cells text strings"
            >
              <Copy className="w-3 h-3 text-[#00FF41]" />
              <span className="hidden sm:inline">Copy Text</span>
            </button>
            <button 
              onClick={handleDownloadTxt}
              className="px-2 py-1 bg-[#1A1A1A] hover:bg-white hover:text-black border border-[#2A2A2A] text-[10px] uppercase font-mono tracking-tight transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Export Txt</span>
            </button>
            <button 
              onClick={() => setNfoModalOpen(true)}
              className="px-2 py-1 bg-[#1A1A1A] hover:bg-white hover:text-black border border-[#2B2B2B] text-[10px] uppercase font-mono tracking-tight text-yellow-400 font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="Export as a compliant modern or legacy DOS NFO file"
            >
              <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
              <span>Export NFO</span>
            </button>
            <button 
              onClick={handleDownloadJson}
              className="px-2 py-1 bg-[#1A1A1A] hover:bg-white hover:text-black border border-[#2A2A2A] text-[10px] uppercase font-mono tracking-tight transition-colors flex items-center gap-1 cursor-pointer"
              title="Download canvas matrix as editable JSON payload"
            >
              <FileCode className="w-3 h-3 text-[#38BDF8]" />
              <span className="hidden sm:inline">JSON PROJ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main interface stack */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Compact left side panel for active brush coordinates and drawing mode indicators */}
        <aside className="w-12 border-r border-[#2A2A2A] flex flex-col items-center py-4 space-y-3.5 bg-[#111111] shrink-0 relative z-20">
          
          <div className="text-[9px] text-[#2A2A2A] font-bold select-none tracking-widest uppercase mb-1">
            TOOLS
          </div>

          {[
            { id: "pen", name: "Draw Pen", short: "PN" },
            { id: "eraser", name: "Eraser", short: "ER" },
            { id: "fill", name: "Flood Fill", short: "FL" },
            { id: "shading", name: "Shader Cycle", short: "SH" },
            { id: "line", name: "Line Draw", short: "LN" },
            { id: "rect", name: "Rectangle Outline", short: "RC" },
            { id: "circle", name: "Circle Outline", short: "CI" },
          ].map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as DrawingTool)}
                title={`${tool.name} tool`}
                className={`
                  w-8 h-8 flex flex-col items-center justify-center font-mono text-[9px] font-bold rounded uppercase tracking-tighter transition-all border cursor-pointer
                  ${isActive 
                    ? "bg-[#00FF41] text-black border-white shadow-[0_0_10px_rgba(0,255,65,0.4)]" 
                    : "bg-[#1A1A1A] text-gray-500 border-[#2A2A2A] hover:bg-[#2A2A2A] hover:text-white"
                  }
                `}
              >
                <span>{tool.short}</span>
              </button>
            );
          })}

          <div className="mt-auto flex flex-col items-center gap-2">
            <button 
              onClick={() => setShowScanlines(!showScanlines)}
              className={`p-1.5 rounded border transition-colors cursor-pointer ${showScanlines ? "bg-[#1A1A1A] text-emerald-400 border-emerald-500" : "bg-[#111111] text-stone-600 border-transparent"}`}
              title="Toggle scanline effect"
            >
              <Eye className="w-4 h-4" />
            </button>
            <div className="text-[9px] text-stone-600 font-bold tracking-tighter">
              {width}C
            </div>
          </div>
        </aside>

        {/* Central interactive matrix grid section */}
        <main className="flex-1 bg-black p-4 flex flex-col items-center justify-center overflow-auto relative z-10 custom-scrollbar">
          
          {/* Top layout configurations panel */}
          <div className="w-full max-w-4xl mb-3 flex flex-col lg:flex-row gap-2 justify-between items-center bg-[#141414] border border-[#2A2A2A] p-3 rounded shrink-0">
            
            {/* Rapid resolution adjustments */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] uppercase text-gray-500 tracking-wider">Configure Resolution:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { text: "20x10", w: 20, h: 10 },
                  { text: "40x20", w: 40, h: 20 },
                  { text: "60x30", w: 60, h: 30 },
                  { text: "80x40", w: 80, h: 40 }
                ].map((preset) => {
                  const isMatch = width === preset.w && height === preset.h;
                  return (
                    <button
                      key={preset.text}
                      onClick={() => handleResizeGrid(preset.w, preset.h)}
                      className={`px-2 py-1 text-[9px] uppercase border transition-all cursor-pointer ${
                        isMatch 
                          ? "bg-stone-100 text-black border-white font-bold" 
                          : "bg-stone-950 text-gray-400 border-[#2A2A2A] hover:bg-[#1C1C1C]"
                      }`}
                    >
                      {preset.text}
                    </button>
                  );
                })}
              </div>

              {/* Custom size submit form */}
              <div className="flex items-center gap-1 border-l border-[#2A2A2A] pl-3">
                <input
                  type="number"
                  placeholder="Cols"
                  value={newWidthInput}
                  onChange={(e) => setNewWidthInput(e.target.value)}
                  className="w-10 bg-black text-[#00FF41] border border-[#2A2A2A] px-1 py-0.5 text-[10px] outline-none text-center"
                  min="5"
                  max="120"
                />
                <span className="text-stone-600 font-bold select-none">[x]</span>
                <input
                  type="number"
                  placeholder="Rows"
                  value={newHeightInput}
                  onChange={(e) => setNewHeightInput(e.target.value)}
                  className="w-10 bg-black text-[#00FF41] border border-[#2A2A2A] px-1 py-0.5 text-[10px] outline-none text-center"
                  min="5"
                  max="80"
                />
                <button
                  onClick={() => handleResizeGrid(Number(newWidthInput), Number(newHeightInput))}
                  className="px-1.5 py-0.5 bg-[#2A2A2A] hover:bg-white hover:text-black border border-[#3A3A3A] transition-colors text-[9px]"
                >
                  SET
                </button>
              </div>
            </div>

            {/* Undo, Redo, Clear Quick Buttons */}
            <div className="flex items-center gap-2 mt-2 lg:mt-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#2A2A2A] w-full lg:w-auto justify-end">
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className={`px-2 py-1 text-[10px] border flex items-center gap-1 transition-all cursor-pointer ${
                  history.length > 0 
                    ? "bg-[#1C1C1C] text-stone-200 border-[#2A2A2A] hover:bg-[#2C2C2C]" 
                    : "bg-[#0F0F0F] text-stone-700 border-[#1F1F1F] cursor-not-allowed"
                }`}
              >
                <span>UNDO</span>
              </button>
              <button
                onClick={handleRedo}
                disabled={redoHistory.length === 0}
                className={`px-2 py-1 text-[10px] border flex items-center gap-1 transition-all cursor-pointer ${
                  redoHistory.length > 0 
                    ? "bg-[#1C1C1C] text-stone-200 border-[#2A2A2A] hover:bg-[#2C2C2C]" 
                    : "bg-[#0F0F0F] text-stone-700 border-[#1F1F1F] cursor-not-allowed"
                }`}
              >
                <span>REDO</span>
              </button>
              <button
                onClick={handleFloodAll}
                className="px-2 py-1 bg-[#1C1C1C] border border-[#2A2A2A] text-[10px] hover:bg-yellow-950/20 hover:text-yellow-400 transition-colors cursor-pointer"
                title="Flood entire grid with active foreground color"
              >
                PAINT GRID
              </button>
              <button
                onClick={handleClearMatrix}
                className="px-2 py-1 bg-red-950/30 border border-red-900/40 text-red-400 text-[10px] hover:bg-red-900/60 hover:text-white transition-colors cursor-pointer"
              >
                RESET
              </button>
            </div>
          </div>

          {/* Interactive drawing canvas container wrapper */}
          <div className="relative border border-[#2A2A2A] p-1 shadow-2xl rounded bg-[#050505]">
            <DrawingCanvas
              canvasState={{ width, height, grid }}
              onCellInteract={onCellInteract}
              activeTool={activeTool}
              isDrawing={isDrawing}
              setIsDrawing={setIsDrawing}
              fgColor={fgColor}
              bgColor={bgColor}
              currChar={currChar}
              previewOverlay={previewOverlay}
            />
          </div>

          {/* Tips notification banner */}
          <div className="mt-3 text-[10px] text-gray-500 font-mono text-center max-w-lg select-text uppercase tracking-normal">
            ⚙️ <span className="text-[#00FF41]">MATRIX INSIGHT: </span> 
            {paletteAdvice ? paletteAdvice : "Select different character brushes from the right pane. Try 'Bucket Fill' to fill color regions, or 'Shader' to paint smooth shadows, gradients, and block highlights."}
          </div>
        </main>

        {/* Right workspace panels container */}
        <aside className="w-80 border-l border-[#2A2A2A] flex flex-col bg-[#111111] shrink-0 relative z-20">
          
          {/* Section Selector Tab list */}
          <div className="flex bg-[#141414] border-b border-[#2A2A2A] shrink-0 text-center">
            {[
              { id: "brush", label: "BRUSH" },
              { id: "generator", label: "GEMINI AI" },
              { id: "converter", label: "PHOTO" },
              { id: "library", label: "DESIGNS" },
            ].map((tab) => {
              const isActive = activeSidebarTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSidebarTab(tab.id as any)}
                  className={`flex-1 py-2 text-[9px] font-bold tracking-wider hover:text-white transition-all border-b border-r border-transparent cursor-pointer ${
                    isActive 
                      ? "bg-[#0D0D0D] text-[#00FF41] border-b-[#00FF41] font-extrabold border-r-[#2A2A2A]" 
                      : "text-gray-500 hover:bg-[#1A1A1A] border-r-[#2A2A2A]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Scrollable controls panel items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#2A2A2A] custom-scrollbar">
            
            {/* TAB: Brush configuration, presets glyph bank, and Color palette picker */}
            {activeSidebarTab === "brush" && (
              <>
                {/* Character selection panel */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] uppercase text-gray-500 tracking-widest flex items-center gap-1.5 font-bold">
                      <Sliders className="w-3.5 h-3.5 text-[#00FF41]" />
                      <span>Glyph Brush selection</span>
                    </div>
                    {currChar && (
                      <span className="text-[10px] font-bold text-gray-300 font-mono bg-[#1A1A1A] px-2 py-0.5 border border-[#2A2A2A]">
                        Current: '{currChar || "Space"}'
                      </span>
                    )}
                  </div>

                  <div className="space-y-3.5">
                    {BRUSH_BANKS.map((bank) => (
                      <div key={bank.name} className="space-y-1 bg-[#141414] p-2 border border-[#1F1F1F] rounded">
                        <div className="text-[8px] uppercase tracking-widest text-[#00FF41] font-bold font-mono">
                          {bank.name}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {bank.chars.map((ch) => {
                            const isSelected = currChar === ch && activeTool !== "eraser";
                            return (
                              <button
                                key={ch}
                                onClick={() => {
                                  setCurrChar(ch);
                                  if (activeTool === "eraser") {
                                    setActiveTool("pen");
                                  }
                                }}
                                className={`
                                  w-7 h-7 flex items-center justify-center font-mono rounded text-xs transition-colors border cursor-pointer
                                  ${isSelected 
                                    ? "bg-[#00FF41] text-black border-white font-extrabold shadow-[0_0_8px_rgba(0,255,65,0.4)]" 
                                    : "bg-[#1C1C1C] text-stone-100 hover:bg-[#2A2A2A] border-[#2A2A2A]"
                                  }
                                `}
                              >
                                {ch === " " ? "∅" : ch}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Custom brush input box */}
                    <div className="space-y-1">
                      <div className="text-[8px] uppercase tracking-widest text-gray-500 font-bold font-mono">
                        Add Custom Unicode character:
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          maxLength={1}
                          placeholder="e.g. ★, ♫, ☯, ☣, 🐱"
                          className="flex-1 bg-black text-[#00FF41] border border-[#2A2A2A] text-[10px] px-2.5 py-1.5 focus:border-[#00FF41] focus:outline-none"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              setCurrChar(val[0]);
                              if (activeTool === "eraser") {
                                setActiveTool("pen");
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cyber swatches table colors selector */}
                <div className="p-4 space-y-3 bg-[#0E0E0E]">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] uppercase text-gray-500 tracking-widest flex items-center gap-1.5 font-bold">
                      <Palette className="w-3.5 h-3.5 text-blue-400" />
                      <span>Retro Palette Blocks</span>
                    </div>

                    <select
                      value={selectedPaletteKey}
                      onChange={(e) => handlePaletteKeyChange(e.target.value)}
                      className="bg-black text-gray-300 text-[9px] border border-[#2A2A2A] px-2 py-1 outline-none font-bold uppercase cursor-pointer hover:border-gray-400"
                    >
                      <option value="crt">TERMINAL GREEN</option>
                      <option value="cyberpunk">CYBERPUNK NEON</option>
                      <option value="gameboy">GAMEBOY RETRO</option>
                      <option value="vaporwave">VAPORWAVE RETRO</option>
                      <option value="autumn">AUTUMN FOREST</option>
                      <option value="pastel">CHROMA PASTEL</option>
                    </select>
                  </div>

                  {/* Selected RGB Swatch details */}
                  <div className="grid grid-cols-2 gap-2 p-2 bg-[#141414] border border-[#1E1E1E] rounded text-[9px]">
                    <div className="space-y-1">
                      <span className="text-[#00FF41] uppercase tracking-tighter">Foreground:</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={fgColor.startsWith("#") ? fgColor : "#00FF41"}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                        />
                        <span className="font-mono text-gray-100 font-bold">{fgColor}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[#FF007F] uppercase tracking-tighter">Background:</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={bgColor.startsWith("#") ? bgColor : "#000000"}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                        />
                        <span className="font-mono text-gray-100 font-bold">{bgColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active color palette cells */}
                  <div className="grid grid-cols-8 gap-1 pl-1">
                    {activePalette.map((pColor, i) => {
                      const isFg = fgColor.toLowerCase() === pColor.hex.toLowerCase();
                      const isBg = bgColor.toLowerCase() === pColor.hex.toLowerCase();
                      return (
                        <div key={`${pColor.hex}-${i}`} className="flex flex-col items-center">
                          <button
                            onClick={() => setFgColor(pColor.hex)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setBgColor(pColor.hex);
                              showToast(`Set ${pColor.name} as background.`, "info");
                            }}
                            className={`
                              w-7 h-7 rounded border relative transition-transform hover:scale-105 active:scale-90 cursor-pointer
                              ${isFg ? "ring-2 ring-white scale-110 z-10 border-white" : "border-[#2A2A2A]"}
                            `}
                            style={{ backgroundColor: pColor.hex }}
                            title={`${pColor.name} (${pColor.accent}) - Right click for background`}
                          >
                            {isBg && (
                              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-extrabold text-black bg-white/65 font-sans">
                                BG
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[8px] text-gray-500 font-mono text-center">
                    (Left-click for Foreground • Right-click for Background)
                  </div>
                </div>
              </>
            )}

            {/* TAB: Gemini AI Generative intelligence desk */}
            {activeSidebarTab === "generator" && (
              <div className="p-4 space-y-4">
                
                {/* AI Generative Art */}
                <div className="space-y-2.5">
                  <div className="text-[10px] uppercase text-gray-500 tracking-widest flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Gemini AI ASCII Generator</span>
                  </div>

                  <p className="text-[9px] text-gray-400">
                    Submit a descriptive prompt. Gemini will synthesize and rasterize a perfect matching ASCII template grid.
                  </p>

                  <div className="space-y-2">
                    <textarea
                      placeholder="e.g. Retro vintage muscle car, majestic skull, space station fighter..."
                      value={generatorPrompt}
                      onChange={(e) => setGeneratorPrompt(e.target.value)}
                      rows={3}
                      className="w-full bg-black text-[#00FF41] border border-[#2A2A2A] px-2 py-1.5 text-[10px] outline-none focus:border-[#00FF41] font-mono custom-scrollbar resize-none"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Brush Style:</span>
                        <select
                          value={generatorStyle}
                          onChange={(e) => setGeneratorStyle(e.target.value)}
                          className="w-full bg-black text-gray-300 border border-[#2A2A2A] px-1 py-1 text-[9px] outline-none font-bold uppercase cursor-pointer"
                        >
                          <option value="blocks">SOLID BLOCKS</option>
                          <option value="braille">BRAILLE PATHS</option>
                          <option value="cyberpunk">COMPLEX CYBER</option>
                          <option value="lineart">LINE CORNERS</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Tint State:</span>
                        <div className="text-[9px] py-1 text-[#00FF41] font-bold font-mono">
                          Phosphor Green
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateAIScene}
                      disabled={isGeneratingAI}
                      className={`w-full py-2 border transition-all font-bold tracking-widest text-[10px] uppercase cursor-pointer ${
                        isGeneratingAI 
                          ? "bg-black text-[#2A2A2A] border-[#2A2A2A] cursor-wait" 
                          : "bg-[#00FF41] text-black hover:bg-white hover:border-white border-transparent"
                      }`}
                    >
                      {isGeneratingAI ? "SYNTHESIZING MATRIX..." : "⚡ GENERATE ASCII MODEL"}
                    </button>
                  </div>
                </div>

                {/* AI Palette suggest desk */}
                <div className="space-y-2.5 pt-4 border-t border-[#2A2A2A]">
                  <div className="text-[10px] uppercase text-gray-500 tracking-widest flex items-center gap-1.5 font-bold">
                    <MessageSquareCode className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Gemini Palette & Advice generator</span>
                  </div>

                  <p className="text-[9px] text-gray-400">
                    Input a theme or mood (e.g. "cyberpunk deep dive bar", "snowy foggy mountain") to acquire tailored palette matching instructions.
                  </p>

                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. Spooky pirate cavern"
                      value={palettePrompt}
                      onChange={(e) => setPalettePrompt(e.target.value)}
                      className="w-full bg-black text-[#00FF41] border border-[#2A2A2A] px-2 py-1.5 text-[10px] outline-none focus:border-[#00FF41] font-mono"
                    />

                    <button
                      onClick={handleSuggestPalette}
                      disabled={isGettingSuggestions}
                      className={`w-full py-2 border transition-all font-bold tracking-widest text-[10px] uppercase cursor-pointer ${
                        isGettingSuggestions 
                          ? "bg-black text-gray-600 border-[#2A2A2A] cursor-wait" 
                          : "bg-[#1A1A1A] text-gray-200 hover:bg-white hover:text-black border-[#2A2A2A]"
                      }`}
                    >
                      {isGettingSuggestions ? "ANALYZING SYSTEM..." : "⚡ ACQUIRE DESIGN STRATEGY"}
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: Local photo to ASCII pixel translator desk */}
            {activeSidebarTab === "converter" && (
              <div className="p-4 space-y-4">
                
                {/* Photo Converter File block */}
                <div className="space-y-2.5">
                  <div className="text-[10px] uppercase text-gray-500 tracking-widest flex items-center gap-1.5 font-bold">
                    <FileImage className="w-3.5 h-3.5 text-[#FF007F]" />
                    <span>Photo-to-ASCII Matrix converter</span>
                  </div>

                  <p className="text-[9px] text-gray-400">
                    Upload a local image (JPG, PNG). The system computes layout parameters, luminance values, scales coordinates down, and transforms pixel tones to colorized ASCII block sequences!
                  </p>

                  <div className="border border-[#2A2A2A] border-dashed p-4 flex flex-col items-center justify-center bg-black hover:bg-[#111] transition-all rounded relative group">
                    <Upload className="w-6 h-6 text-[#2A2A2A] group-hover:text-[#00FF41] transition-colors mb-2" />
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider text-center">
                      Choose Or Drag Image Here
                    </span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>

                  <div className="p-2 bg-[#141414] border border-[#2A2A2A] rounded">
                    <div className="text-[8px] uppercase text-[#00FF41] tracking-widest font-bold">
                      CONVERSION SPECS:
                    </div>
                    <ul className="list-disc pl-4 text-[9px] text-gray-400 space-y-0.5 mt-1 font-mono">
                      <li>Matches target dimensions: {width}x{height}</li>
                      <li>High Density shade levels scaling: luminance thresholds mapping</li>
                      <li>Renders colorized cells: maps pixel colors</li>
                    </ul>
                  </div>
                </div>

                {/* Text Banners stamping utility */}
                <div className="space-y-2.5 pt-4 border-t border-[#2A2A2A]">
                  <div className="text-[10px] uppercase text-gray-500 tracking-widest flex items-center gap-1.5 font-bold">
                    <Command className="w-3.5 h-3.5 text-yellow-500" />
                    <span>ASCII Typewriter Banner Utility</span>
                  </div>

                  <p className="text-[9px] text-gray-400 font-mono">
                    Type text and click to stamp customized retro banners into the grid matrix.
                  </p>

                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Type header..."
                      value={bannerString}
                      onChange={(e) => setBannerString(e.target.value)}
                      className="w-full bg-black text-[#00FF41] border border-[#2A2A2A] px-2 py-1.5 text-[10px] font-mono outline-none"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase text-gray-500 font-bold">Stamp X Pos:</span>
                        <input
                          type="number"
                          value={bannerX}
                          onChange={(e) => setBannerX(Number(e.target.value))}
                          className="w-full bg-black text-gray-300 border border-[#2A2A2A] px-1.5 py-1 text-[10px]"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase text-gray-500 font-bold">Stamp Y Pos:</span>
                        <input
                          type="number"
                          value={bannerY}
                          onChange={(e) => setBannerY(Number(e.target.value))}
                          className="w-full bg-black text-gray-300 border border-[#2A2A2A] px-1.5 py-1 text-[10px]"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleStampBannerText}
                      className="w-full py-1.5 bg-[#1C1C1C] hover:bg-[#00FF41] hover:text-black hover:border-transparent border border-[#2A2A2A] text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer"
                    >
                      STAMP TEXT BANNER
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: Built-in library catalog and user designs storage locker */}
            {activeSidebarTab === "library" && (
              <div className="p-4 space-y-4">
                
                {/* Save Current drawing panel desk */}
                <div>
                  <button
                    onClick={() => {
                      setSavePaintingName("");
                      setSaveModalOpen(true);
                    }}
                    className="w-full py-2 bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#00FF41] hover:text-[#00FF41] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Current drawing</span>
                  </button>
                </div>

                {/* Built-in high density templates library */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase text-gray-500 tracking-widest flex items-center gap-1.5 font-bold">
                    <FolderOpen className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Catalog Preset Templates</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleLoadPreset(p.id)}
                        className="p-2 bg-[#141414] hover:bg-[#1A1A1A] border border-[#2A2A2A] hover:border-gray-400 transition-colors text-left rounded cursor-pointer group"
                      >
                        <div className="text-[10px] font-bold text-gray-200 group-hover:text-[#00FF41] truncate font-mono">
                          {p.name}
                        </div>
                        <div className="text-[8px] text-gray-500 font-mono mt-0.5">
                          {p.width}x{p.height} ({p.category})
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Saved User locker paintings library */}
                <div className="space-y-2 pt-4 border-t border-[#2A2A2A]">
                  <div className="text-[10px] uppercase text-gray-500 tracking-widest flex items-center gap-1.5 font-bold">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>Saved drawings Library</span>
                  </div>

                  {savedPaintings.length === 0 ? (
                    <div className="text-[9px] text-gray-600 italic text-center py-4 border border-[#1A1A1A] rounded bg-black">
                      No user drawings found in storage locker. Click "Save Current Drawing" above to persistent cache.
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {savedPaintings.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleLoadSavedItem(item)}
                          className="p-2 bg-[#141414] hover:bg-[#1A1A1A] border border-[#2A2A2A] transition-all rounded flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex-1 min-w-0 pr-1">
                            <div className="text-[10px] font-bold text-gray-300 group-hover:text-[#00FF41] truncate font-mono">
                              {item.name}
                            </div>
                            <div className="text-[8px] text-gray-500 mt-0.5">
                              {item.state.width}x{item.state.height} • {item.createdAt}
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => handleDeleteSavedItem(item.id, e)}
                            className="text-stone-600 hover:text-red-400 p-1 cursor-pointer transition-colors"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Canvas telemetry matrix variables info box */}
          <div className="p-3 bg-black border-t border-[#2A2A2A] mt-auto shrink-0 relative text-[9px] text-gray-500">
            <div className="text-[#00FF41] uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>DIAGNOSTIC TELEMETRY</span>
            </div>
            <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-[9px] font-mono leading-tight bg-[#0A0A0A] p-2 border border-[#1F1F1F]">
              <div>ACTIVE CHR: <span className="text-stone-300 font-bold">'{currChar}'</span></div>
              <div>MODE: <span className="text-stone-300 font-bold uppercase">{activeTool}_ENG</span></div>
              <div>CLIP DEPTH: <span className="text-stone-300 font-bold">{history.length} STEPS</span></div>
              <div>REDO DEPTH: <span className="text-stone-300 font-bold">{redoHistory.length} STEPS</span></div>
              <div>BUFFER: <span className="text-stone-300 font-bold">{(width * height * 4)} BYTES</span></div>
              <div>GRID SCALE: <span className="text-stone-300 font-bold">{width}x{height} CELLS</span></div>
            </div>
          </div>
        </aside>

      </div>

      {/* Retro Status footer bar matching coordinates exact rules */}
      <footer className="h-6 border-t border-[#2A2A2A] bg-[#141414] px-4 flex items-center justify-between text-[10px] text-gray-500 select-none shrink-0 relative z-20">
        <div className="flex space-x-6 items-center">
          <div className="flex items-center space-x-2">
            <span>COORDS:</span>
            {hoveredCoordinate ? (
              <span className="text-white bg-[#2A2A2A] px-1 font-bold">
                X: {String(hoveredCoordinate.x).padStart(3, " ")} Y: {String(hoveredCoordinate.y).padStart(3, " ")}
              </span>
            ) : (
              <span className="text-gray-600">X: --- Y: ---</span>
            )}
          </div>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline uppercase">
            BRUSH: <b className="text-[#00FF41]">'{currChar}'</b>
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden md:inline uppercase">
            PALETTE_THEME: <b className="text-blue-400">{selectedPaletteKey.toUpperCase()}</b>
          </span>
        </div>

        <div className="flex space-x-4">
          <span className="hidden xs:inline">STORAGE_OK: LOCAL_DB [ACTIVE]</span>
          <span className="text-[#00FF41] tracking-wider font-bold">MODE:PAINT_CYCLES</span>
        </div>
      </footer>

      {/* SAVE PROJECT MODAL DIALOG */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-[#111111] border border-[#2A2A2A] shadow-2xl p-5 rounded">
            <div className="flex justify-between items-center pb-2 border-b border-[#2A2A2A] mb-4">
              <span className="font-bold text-white uppercase tracking-widest text-[11px] flex items-center gap-1.5">
                <Save className="w-4 h-4 text-[#00FF41]" />
                <span>SAVE DRAWING ASSET</span>
              </span>
              <button 
                onClick={() => setSaveModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveToVault} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                  Enter drawing identifier/name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neon Cyberpunk City, My Sword #1"
                  value={savePaintingName}
                  onChange={(e) => setSavePaintingName(e.target.value)}
                  className="w-full bg-black text-[#00FF41] border border-[#2A2A2A] px-2.5 py-1.5 text-xs outline-none focus:border-[#00FF41] font-mono"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1C1C1C]">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-3 py-1.5 bg-[#1C1C1C] border border-[#2A2A2A] text-gray-300 text-[10px] uppercase font-bold hover:bg-[#2A2A2A] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00FF41] hover:bg-white text-black text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-colors"
                >
                  COMMIT TO VAULT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HELP MATRIX INDEX DIALOG */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#111111] border border-[#2A2A2A] shadow-2xl p-5 rounded font-mono text-[10px] space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-[#2A2A2A]">
              <span className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#38BDF8]" />
                <span>ASCII PAINT CORE SPECS v2.5</span>
              </span>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 divide-y divide-[#1C1C1C] text-gray-300">
              <div className="space-y-1.5 py-2">
                <h4 className="text-[#00FF41] font-bold uppercase text-[10px] tracking-wider">📦 Drawing Canvas Suite</h4>
                <p>Click and drag your mouse over the central canvas to paint. Change tools using corresponding shorthand identifiers (ER for eraser, SH for shading cycles, FL for Flood bucket fills).</p>
              </div>

              <div className="space-y-1.5 py-2">
                <h4 className="text-[#38BDF8] font-bold uppercase text-[10px] tracking-wider">✏️ Shape tools (Line, Rectangle, Circle)</h4>
                <p>Equip shape tools to draw perfect geometries. Press and drag to see real-time character skeletal outlines before releasing to permanently rasterize the shape.</p>
              </div>

              <div className="space-y-1.5 py-2">
                <h4 className="text-yellow-400 font-bold uppercase text-[10px] tracking-wider">🤖 Neural Gemini Assistant</h4>
                <p>Use the Gemini AI tab to construct comprehensive generated models directly into coordinates. Describe design concepts or ask for color palettes tailored to your theme layout.</p>
              </div>

              <div className="space-y-1.5 py-2">
                <h4 className="text-pink-500 font-bold uppercase text-[10px] tracking-wider">🖼️ Image Rasterizer Translator</h4>
                <p>Upload files in the Photo tab. Squeezes resolutions down dynamically, matches luminance weights to selected characters density blocks, and maps pixel colors to coordinates.</p>
              </div>

              <div className="space-y-1.5 py-2">
                <h4 className="text-purple-400 font-bold uppercase text-[10px] tracking-wider">💾 Local Project Vault Storage</h4>
                <p>Every drawing can be easily saved directly to your local persistent storage space with custom labels so that you can reload any workspace at any time without data loss!</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#2A2A2A]">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-[#00FF41] hover:bg-white text-black font-extrabold uppercase tracking-wide cursor-pointer transition-colors"
              >
                ACKNOWLEDGE COMMANDS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NFO EXPORT MODAL DIALOG */}
      {nfoModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#111111] border border-[#2A2A2A] shadow-2xl p-5 rounded font-mono text-[10px] space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-[#2A2A2A]">
              <span className="font-bold text-white uppercase tracking-widest text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span>DEMOSCENE NFO EXPORTER v2.5</span>
              </span>
              <button 
                onClick={() => setNfoModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Settings parameters */}
              <div className="space-y-3.5">
                <div className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Configure metadata</div>
                
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400">Include release header info:</label>
                  <div className="flex gap-4 mt-0.5">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[#00FF41]">
                      <input 
                        type="radio" 
                        checked={nfoIncludeHeader} 
                        onChange={() => setNfoIncludeHeader(true)} 
                        className="accent-[#00FF41] cursor-pointer"
                      />
                      <span>YES (STAMP)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-500">
                      <input 
                        type="radio" 
                        checked={!nfoIncludeHeader} 
                        onChange={() => setNfoIncludeHeader(false)} 
                        className="accent-stone-500 cursor-pointer"
                      />
                      <span>NO HEADERS</span>
                    </label>
                  </div>
                </div>

                {nfoIncludeHeader && (
                  <div className="space-y-2.5 p-2 bg-[#141414] border border-[#202020] rounded">
                    <div className="space-y-1">
                      <label className="text-[8px] text-gray-500 uppercase font-bold">Artist/Handle:</label>
                      <input 
                        type="text" 
                        value={nfoArtist} 
                        onChange={(e) => setNfoArtist(e.target.value)} 
                        className="w-full bg-black text-white border border-[#2A2A2A] px-2 py-1 text-[10px] focus:border-[#00FF41] outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-gray-500 uppercase font-bold">Crew/Group:</label>
                      <input 
                        type="text" 
                        value={nfoGroup} 
                        onChange={(e) => setNfoGroup(e.target.value)} 
                        className="w-full bg-black text-white border border-[#2A2A2A] px-2 py-1 text-[10px] focus:border-[#00FF41] outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-gray-500 uppercase font-bold">Artwork Title:</label>
                      <input 
                        type="text" 
                        value={nfoTitle} 
                        onChange={(e) => setNfoTitle(e.target.value)} 
                        className="w-full bg-black text-white border border-[#2A2A2A] px-2 py-1 text-[10px] focus:border-[#00FF41] outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 block uppercase font-bold">NFO Encoding standard:</span>
                  <div className="flex flex-col gap-1.5 mt-1 bg-[#141414] p-2 border border-[#202020] rounded">
                    <label className="flex items-center gap-1.5 cursor-pointer text-blue-400">
                      <input 
                        type="radio" 
                        name="encoding"
                        checked={nfoEncoding === "cp437"} 
                        onChange={() => setNfoEncoding("cp437")} 
                        className="accent-blue-400 cursor-pointer"
                      />
                      <span title="Best for original DOS viewers & BBS systems with raw block bytes (DB, DC, DF, B0, B1, B2)">
                        DOS CP437 (HEX BINARY)
                      </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[#00FF41]">
                      <input 
                        type="radio" 
                        name="encoding"
                        checked={nfoEncoding === "utf8"} 
                        onChange={() => setNfoEncoding("utf8")} 
                        className="accent-[#00FF41] cursor-pointer"
                      />
                      <span title="Best for modern web, vscode, windows notepad text apps">
                        MODERN UTF-8 (PLAIN TXT)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview window */}
              <div className="flex flex-col h-full space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Live NFO file preview</span>
                <div className="flex-1 bg-black border border-[#2A2A2A] p-2.5 rounded text-white overflow-auto max-h-[190px] font-mono text-[7px] leading-tight select-text custom-scrollbar whitespace-pre">
                  {generateNfoText()}
                </div>
                <div className="text-[8px] text-stone-500 leading-normal italic font-mono uppercase">
                  (Preview is rendered in UTF-8 for web view compatibility)
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#2A2A2A]">
              <button
                type="button"
                onClick={() => setNfoModalOpen(false)}
                className="px-3 py-1.5 bg-[#1C1C1C] border border-[#2A2A2A] text-gray-300 text-[10px] uppercase font-bold hover:bg-[#2A2A2A] cursor-pointer"
              >
                CLOSE
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generateNfoText());
                  showToast("Copied NFO preview data to clipboard!", "success");
                }}
                className="px-3 py-1.5 bg-[#1C1C1C] border border-blue-900 text-blue-400 text-[10px] uppercase font-bold hover:bg-blue-950/20 cursor-pointer"
              >
                COPY NFO TXT
              </button>
              <button
                type="button"
                onClick={handleDownloadNfo}
                className="px-4 py-1.5 bg-[#00FF41] hover:bg-white text-black text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-colors"
              >
                DOWNLOAD .NFO
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
