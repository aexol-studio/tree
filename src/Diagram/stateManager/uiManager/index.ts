import { EventBus } from "../../../EventBus";
import { UIState } from "../../../Models/UIState";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import * as Events from "../../../Events";

/**
 * UIManager:
 *
 * Main zoom/pan class
 */
export class UIManager {
  constructor(
    private state: UIState,
    private eventBus: EventBus,
  ) {
    this.eventBus.subscribe(Events.IOEvents.ScreenMouseMove, this.mouseMove);
    this.eventBus.subscribe(Events.IOEvents.ScreenMouseWheel, this.mouseWheel);
    this.eventBus.subscribe(Events.IOEvents.ScreenMouseDrag, this.mouseDrag);
    this.eventBus.subscribe(Events.IOEvents.ScreenLeftMouseClick, this.LMBPressed);
  }

  mouseWheel = (delta: number, mouseX: number, mouseY: number) => {

    let scaleChange = delta / -800.0;

    let newScale = this.state.scale + scaleChange;

    if (newScale < 0.2) {
      newScale = 0.2;
    }

    if (newScale > 1.0) {
      newScale = 1.0;
    }

    this.state.panX! = this.state.panX! + (mouseX / newScale) - (mouseX / this.state.scale);
    this.state.panY! = this.state.panY! + (mouseY / newScale) - (mouseY / this.state.scale);

    this.state.scale = newScale;

    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  }

  worldToScreen = (e: ScreenPosition): ScreenPosition => {
    return {
      x: (e.x + this.state.panX!) * this.state.scale,
      y: (e.y + this.state.panY!) * this.state.scale,
      shiftKey: e.shiftKey
    };
  };
  calculateMousePosition = (e: ScreenPosition): ScreenPosition => {
    return {
      x: (e.x) / this.state.scale - this.state.panX!,
      y: (e.y) / this.state.scale - this.state.panY!,
      shiftKey: e.shiftKey,
    };
  }

  mouseMove = (e: ScreenPosition) => {
    this.eventBus.publish(Events.IOEvents.WorldMouseMove, {
      x: (e.x) / this.state.scale - this.state.panX!,
      y: (e.y) / this.state.scale - this.state.panY!,
      shiftKey: e.shiftKey,
    });
  };

  mouseDrag = (e: ScreenPosition) => {
    this.eventBus.publish(Events.IOEvents.WorldMouseDrag, {
      x: e.x / this.state.scale,
      y: e.y / this.state.scale,
      shiftKey: e.shiftKey,
    });
  };

  LMBPressed = (e: ScreenPosition) => {
    this.state.lastDragPosition = { x: e.x / this.state.scale, y: e.y / this.state.scale };

    this.eventBus.publish(Events.IOEvents.WorldLeftMouseClick, {
      x: (e.x) / this.state.scale - this.state.panX!,
      y: (e.y) / this.state.scale - this.state.panY!,
      shiftKey: e.shiftKey,
    }, {
      x: this.state.panX,
      y: this.state.panY,
    });
  };

  panScreen = (e: ScreenPosition) => {
    this.state.panX! -= (this.state.lastDragPosition!.x) - e.x;
    this.state.panY! -= (this.state.lastDragPosition!.y) - e.y;
    this.state.lastDragPosition = { ...e };
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  }

}
