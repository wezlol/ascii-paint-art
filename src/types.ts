/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DrawingTool = 'pen' | 'eraser' | 'fill' | 'shading' | 'line' | 'rect' | 'circle';

export interface Cell {
  char: string;
  fg: string;      // Color hex value (e.g. #00FF00) or Tailwind class
  bg: string;      // Background color hex value (e.g. #1E1E1E)
  isLocked?: boolean;
}

export interface CanvasState {
  width: number;
  height: number;
  grid: Cell[][];  // 2D grid [y][x]
}

export interface Preset {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  grid: string[]; // string representation of the grid
  fgDefault?: string;
  bgDefault?: string;
}

export interface PaletteColor {
  name: string;
  hex: string;
  accent?: string;
}

export interface SavedPainting {
  id: string;
  name: string;
  createdAt: string;
  state: CanvasState;
}
