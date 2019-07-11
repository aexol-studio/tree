import { DiagramTheme, DiagramState } from "../Models";
import { MinimapUtils } from "../Utils/index";

export class MinimapRenderer {
  render(context: CanvasRenderingContext2D, theme: DiagramTheme, state: DiagramState) {
    const uiState = state.uiState;

    if (!uiState.minimapActive) {
      return;
    }

    context.save();
    context.globalAlpha = state.hoverMinimap ? theme.minimap.hoverAlpha : theme.minimap.alpha;

    const minimapStartX = context.canvas.width - theme.minimap.size - theme.minimap.margin;
    const minimapStartY = theme.minimap.margin;

    const boundingBoxViewport = MinimapUtils.getBoundingBoxViewport(
      {
        x: uiState.panX!,
        y: uiState.panY!,
      },
      uiState.scale,
      state.uiState.areaSize,
    );

    const miniMapBoundaries = MinimapUtils.getMiniMapBoundaries(
      boundingBoxViewport,
      state.uiState.areaSize,
    );


    const viewportCoord = MinimapUtils.worldToMapPoint(
      {
        x: boundingBoxViewport.left,
        y: boundingBoxViewport.top,
      },
      theme.minimap.size,
      miniMapBoundaries,
    );

    const areaCoordinates = {
      width: MinimapUtils.worldToMapWidth(boundingBoxViewport.width, miniMapBoundaries, theme.minimap.size),
      height: MinimapUtils.worldToMapHeight(boundingBoxViewport.height, miniMapBoundaries, theme.minimap.size),
      left: viewportCoord.x - 1,
      top: viewportCoord.y - 1
    };

    context.fillStyle = theme.colors.minimap.background;
    context.fillRect(minimapStartX, minimapStartY, theme.minimap.size, theme.minimap.size);
    context.strokeStyle = theme.colors.minimap.borders;
    context.lineWidth = 1;
    context.strokeRect(minimapStartX, minimapStartY, theme.minimap.size, theme.minimap.size);

    context.beginPath();
    context.rect(minimapStartX, minimapStartY, theme.minimap.size, theme.minimap.size);
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
      const nodePos = MinimapUtils.worldToMapPoint(
        n,
        theme.minimap.size,
        miniMapBoundaries,
      );

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
