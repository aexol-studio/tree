import { DiagramTheme, DiagramState } from "../Models";

const MINIMAP_RANGE = 7000;
const MINIMAP_SIZE = 500;
const MINIMAP_MARGIN = 20;

interface MinimapBoundaries {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

export class MinimapRenderer {
  static getBoundingBoxViewport(
    panX: number,
    panY: number,
    scale: number,
    graphWidth: number,
    graphHeight: number,
  ): MinimapBoundaries {
    return {
      left: -panX,
      right: (graphWidth / scale) - panX,
      top: -panY,
      bottom: (graphHeight / scale) - panY,
      width: graphWidth / scale,
      height: graphHeight / scale,
    };
  };

  static getMiniMapBoundaries(
    viewportBoundingBox: MinimapBoundaries,
    graphWidth: number,
    graphHeight: number,
  ) {
    return {
      left: Math.max(
        Math.min(-MINIMAP_RANGE + graphWidth / 2, viewportBoundingBox.left),
        viewportBoundingBox.right - 2 * MINIMAP_RANGE
      ),
      top: Math.max(
        Math.min(-MINIMAP_RANGE + graphHeight / 2, viewportBoundingBox.top),
        viewportBoundingBox.bottom - 2 * MINIMAP_RANGE
      ),
      width: 2 * MINIMAP_RANGE,
      height: 2 * MINIMAP_RANGE
    };
  };

  render(context: CanvasRenderingContext2D, theme: DiagramTheme, state: DiagramState) {
    const uiState = state.uiState;

    if (!uiState.minimapActive) {
      return;
    }

    context.save();
    context.globalAlpha = state.hoverMinimap ? theme.minimap.hoverAlpha : theme.minimap.alpha;

    const graphWidth = context.canvas.width;
    const graphHeight = context.canvas.height;

    const minimapStartX = context.canvas.width - MINIMAP_SIZE - MINIMAP_MARGIN;
    const minimapStartY = MINIMAP_MARGIN;

    const boundingBoxViewport = MinimapRenderer.getBoundingBoxViewport(
      uiState.panX!,
      uiState.panY!,
      uiState.scale,
      graphWidth,
      graphHeight,
    );

    const miniMapBoundaries = MinimapRenderer.getMiniMapBoundaries(
      boundingBoxViewport,
      graphWidth,
      graphHeight,
    );

    const worldToMapWidth = (size: number) => size / (miniMapBoundaries.width / (MINIMAP_SIZE - 1));
    const worldToMapHeight = (size: number) => size / (miniMapBoundaries.height / (MINIMAP_SIZE - 1));

    const worldToMapPoint = (px: number, py: number) => {
      const delta = {
        x: worldToMapWidth(miniMapBoundaries.left + miniMapBoundaries.width / 2),
        y: worldToMapHeight(miniMapBoundaries.top + miniMapBoundaries.height / 2)
      };
      const ratio = miniMapBoundaries.width / (MINIMAP_SIZE - 1);
      return {
        x: MINIMAP_SIZE / 2 - delta.x + px / ratio,
        y: MINIMAP_SIZE / 2 - delta.y + py / ratio
      };
    };

    const viewportCoord = worldToMapPoint(boundingBoxViewport.left, boundingBoxViewport.top);

    const areaCoordinates = {
      width: worldToMapWidth(boundingBoxViewport.width),
      height: worldToMapHeight(boundingBoxViewport.height),
      left: viewportCoord.x - 1,
      top: viewportCoord.y - 1
    };


    context.fillStyle = theme.colors.minimap.background;
    context.fillRect(minimapStartX, minimapStartY, MINIMAP_SIZE, MINIMAP_SIZE);
    context.strokeStyle = theme.colors.minimap.borders;
    context.lineWidth = 1;
    context.strokeRect(minimapStartX, minimapStartY, MINIMAP_SIZE, MINIMAP_SIZE);

    context.rect(minimapStartX, minimapStartY, MINIMAP_SIZE, MINIMAP_SIZE);
    context.clip();

    context.fillStyle = theme.colors.minimap.visibleArea;
    context.fillRect(
      minimapStartX + areaCoordinates.left,
      minimapStartY + areaCoordinates.top,
      areaCoordinates.width,
      areaCoordinates.height,
    );
    context.lineWidth = 1;
    context.strokeRect(
      minimapStartX + areaCoordinates.left,
      minimapStartY + areaCoordinates.top,
      areaCoordinates.width,
      areaCoordinates.height,
    );

    context.fillStyle = theme.colors.minimap.node;
    state.nodes.forEach(n => {
      const nodePos = worldToMapPoint(n.x, n.y);
      context.fillRect(
        minimapStartX + nodePos.x,
        minimapStartY + nodePos.y,
        6,
        4,
      );
    });

    context.restore();

  }
}
