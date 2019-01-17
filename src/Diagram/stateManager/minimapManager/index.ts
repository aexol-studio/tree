import { EventBus } from "../../../EventBus";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import * as Events from "../../../Events";
import { DiagramTheme, DiagramState, Coords } from "../../../Models";
import { MinimapUtils } from "../../../Utils/index";

/**
 * UIManager:
 *
 * Main zoom/pan class
 */
export class MinimapManager {
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
      this.performPanning({x, y});
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

  performPanning(coords: Coords) {

    const boundingBoxViewport = MinimapUtils.getBoundingBoxViewport(
      {
        x: this.state.uiState.panX!,
        y: this.state.uiState.panY!,
      },
      this.state.uiState.scale,
      this.state.uiState.areaSize
    );

    const miniMapBoundaries = MinimapUtils.getMiniMapBoundaries(
      boundingBoxViewport,
      this.state.uiState.areaSize,
    );

    const worldCoords = MinimapUtils.mapToWorldPoint(coords, miniMapBoundaries, this.theme.minimap.size);

    const newPanValue = {
      x: -worldCoords.x + (this.state.uiState.areaSize.width / 2 / this.state.uiState.scale),
      y: -worldCoords.y + (this.state.uiState.areaSize.height / 2 / this.state.uiState.scale),
    };

    const newViewport = MinimapUtils.getBoundingBoxViewport(
      newPanValue,
      this.state.uiState.scale,
      this.state.uiState.areaSize,
    );

    if (
      newViewport.left < miniMapBoundaries.left ||
      newViewport.right > miniMapBoundaries.left + miniMapBoundaries.width
    ) {
      newPanValue.x = this.state.uiState.panX!;
    }

    if (
      newViewport.top < miniMapBoundaries.top ||
      newViewport.bottom > miniMapBoundaries.top + miniMapBoundaries.height
    ) {
      newPanValue.y = this.state.uiState.panY!;
    }

    this.state.uiState.panX = newPanValue.x;
    this.state.uiState.panY = newPanValue.y;
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  }
}