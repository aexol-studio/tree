import { UIState } from "../Models";

/**
 * ZoomPan
 *
 * Service used for calculating canvas transform matrices
 * basing on actual zoom, pan, scale etc.
 */
export class ZoomPan {
  // ...

  setCalculatedMatrix(context: CanvasRenderingContext2D, uiState: UIState) {
    this.setUniformMatrix(context);
    context.scale(uiState.scale, uiState.scale);
    context.translate(uiState.panX!, uiState.panY!);
  }

  setUniformMatrix(context: CanvasRenderingContext2D) {
    context.setTransform(1, 0, 0, 1, 0, 0);
  }
}
