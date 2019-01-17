import { EventBus } from "../../../EventBus";
import { UIState } from "../../../Models/UIState";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import * as Events from "../../../Events";
import { ScreenConstraints } from "../../../IO/ScreenConstraints";
import { DiagramTheme, DiagramState } from "../../../Models";
import { number } from "prop-types";

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
      Events.IOEvents.WorldMouseMove,
      this.worldMouseMove,
    );
  }

  minimapMouseMove = ({x, y}: ScreenPosition) => {
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
}