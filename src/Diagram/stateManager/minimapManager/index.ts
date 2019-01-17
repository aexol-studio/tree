import { EventBus } from "../../../EventBus";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import * as Events from "../../../Events";
import { DiagramTheme, DiagramState } from "../../../Models";

interface MinimapBoundaries {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

const MINIMAP_RANGE = 7000;

/**
 * UIManager:
 *
 * Main zoom/pan class
 */
export class MinimapManager {

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


  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    private theme: DiagramTheme,
  ) {
    this.eventBus.subscribe(
      Events.IOEvents.MinimapMouseMove,
      this.minimapMouseMove,
    );

    this.eventBus.subscribe(
      Events.IOEvents.MinimapLeftMouseClick,
      this.minimapLeftMouseClick,
    );

    this.eventBus.subscribe(
      Events.IOEvents.WorldMouseMove,
      this.worldMouseMove,
    );
  }

  minimapLeftMouseClick = () => {
    this.state.uiState.draggingMinimap = true;
  };

  minimapMouseMove = ({x, y}: ScreenPosition) => {

    if (this.state.uiState.draggingMinimap) {
      this.pan(x, y);
    }

    this.state.hoverMinimap = true;
    this.state.hover.node = undefined;
    this.state.hover.menu = undefined;
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  }

  worldMouseMove = () => {
    if (this.state.hoverMinimap) {
      this.state.hoverMinimap = false;
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };

  pan(x: number, y: number) {
    // get bounding box of actual viewport in world coordinates
    const boundingBoxViewport = MinimapManager.getBoundingBoxViewport(
      this.state.uiState.panX!,
      this.state.uiState.panY!,
      this.state.uiState.scale,
      this.state.uiState.areaSize.width,
      this.state.uiState.areaSize.height,
    );

    // get actual boundaries (left, right, width and height) of the map in world coordinates
    const miniMapBoundaries = MinimapManager.getMiniMapBoundaries(
      boundingBoxViewport,
      this.state.uiState.areaSize.width,
      this.state.uiState.areaSize.height,
    );

    // function converts map coordinates to world coordinates
    const mapToWorldPoint = (px: number, py: number) => {
      const delta = {
        x:
          (miniMapBoundaries.left + miniMapBoundaries.width / 2) /
          (miniMapBoundaries.width / this.theme.minimap.size),
        y:
          (miniMapBoundaries.top + miniMapBoundaries.height / 2) / (miniMapBoundaries.width / this.theme.minimap.size)
      };
      const ratio = miniMapBoundaries.width / this.theme.minimap.size;
      return {
        x: px * ratio - (this.theme.minimap.size / 2 - delta.x) * ratio,
        y: py * ratio - (this.theme.minimap.size / 2 - delta.y) * ratio
      };
    };

    // calculate world coordinates point from the mouse clock X/Y
    const worldCoords = mapToWorldPoint(
      x,
      y
    );

    // calculate potential pan value after the change
    const newPanValue = {
      x: -worldCoords.x + (this.state.uiState.areaSize.width / 2 / this.state.uiState.scale),
      y: -worldCoords.y + (this.state.uiState.areaSize.height / 2 / this.state.uiState.scale),
    };

    const newViewport = MinimapManager.getBoundingBoxViewport(
      newPanValue.x,
      newPanValue.y,
      this.state.uiState.scale,
      this.state.uiState.areaSize.width,
      this.state.uiState.areaSize.height,
    );

    if (
      newViewport.left < miniMapBoundaries.left ||
      newViewport.right > miniMapBoundaries.left + miniMapBoundaries.width
    ) {
      newPanValue.x = this.state.uiState.panX!;
    }

    // ...and y
    if (
      newViewport.top < miniMapBoundaries.top ||
      newViewport.bottom > miniMapBoundaries.top + miniMapBoundaries.height
    ) {
      newPanValue.y = this.state.uiState.panY!;
    }

    this.state.uiState.panX = newPanValue.x;
    this.state.uiState.panY = newPanValue.y;
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);

    // calculate potential new viewport after panning
    /*const newViewport = this.getBoundingBoxViewport(newPanValue);

    // if we're out of the boundaries during panning, clamp those values for x...
    if (
      newViewport.left < miniMapBoundaries.left ||
      newViewport.right > miniMapBoundaries.left + miniMapBoundaries.width
    ) {
      newPanValue.x = pan.x;
    }

    // ...and y
    if (
      newViewport.top < miniMapBoundaries.top ||
      newViewport.bottom > miniMapBoundaries.top + miniMapBoundaries.height
    ) {
      newPanValue.y = pan.y;
    }*/
  }
}