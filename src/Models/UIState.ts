export interface UIState {
  minimapActive?: boolean;
  panX?: number,
  panY?: number,
  scale: number,
  lastDragPosition?: {
    x: number,
    y: number,
  },
  areaSize: {
    width: number,
    height: number,
  },
  draggingWorld: boolean;
  draggingElements: boolean;
  draggingMinimap: boolean;
}
