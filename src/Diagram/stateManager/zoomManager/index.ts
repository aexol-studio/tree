import { EventBus } from "../../../EventBus";
import { UIState } from "../../../Models/UIState";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import * as Events from "../../../Events";

/**
 * zoomManager:
 *
 * Main zoom/pan class
 */
export class ZoomManager {
  constructor(
    private state: UIState,
    private eventBus: EventBus,
  ) {
  }

  mouseWheelAction = (delta: number) => {
    this.state.scale! -= delta / 1000.0;
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  }

  calculateMousePosition = (pos: ScreenPosition): ScreenPosition => {
    return {
      x: pos.x,
      y: pos.y,
      shiftKey: pos.shiftKey,
    };
  }
}
