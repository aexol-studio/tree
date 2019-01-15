export interface UIState {
  minimapActive?: boolean;
  panX?: number,
  panY?: number,
  scale: number,
  lastDragPosition?: {
    x: number,
    y: number,
  },
}
