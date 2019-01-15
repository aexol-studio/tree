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
    this.eventBus.subscribe(Events.IOEvents.MouseMove, this.mouseMove);
    this.eventBus.subscribe(Events.IOEvents.MouseWheel, this.mouseWheel);
    this.eventBus.subscribe(Events.IOEvents.MouseDrag, this.mouseDrag);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.LMBPressed);
    /*this.eventBus.subscribe(Events.IOEvents.MouseOverMove, this.hoverMenu);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.LMBPressed);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.closeMenu);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.clickMenuItem);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseUp, this.openPortMenu);
    this.eventBus.subscribe(Events.IOEvents.RightMouseUp, this.openMenu); */
  }

  mouseWheel = (delta: number) => {
    this.state.scale! -= delta / 1000.0;
    if (this.state.scale < 0.5) {
      this.state.scale = 0.5;
    }
    if (this.state.scale > 2.0) {
      this.state.scale = 2.0;
    }
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  }

  calculateMousePosition = (e: ScreenPosition): ScreenPosition => {
    return {
      x: (e.x) / this.state.scale - this.state.panX!,
      y: (e.y) / this.state.scale - this.state.panY!,
      shiftKey: e.shiftKey,
    };
  }

  mouseMove = (e: ScreenPosition) => {
    this.eventBus.publish(Events.UIEvents.UIMouseMove, {
      x: (e.x) / this.state.scale - this.state.panX!,
      y: (e.y) / this.state.scale - this.state.panY!,
      shiftKey: e.shiftKey,
    });
  };

  mouseDrag = (e: ScreenPosition) => {
    this.eventBus.publish(Events.UIEvents.UIMouseDrag, {
      x: e.x / this.state.scale,
      y: e.y / this.state.scale,
      shiftKey: e.shiftKey,
    });
  };

  LMBPressed = (e: ScreenPosition) => {
    this.state.lastDragPosition = { x: e.x / this.state.scale, y: e.y / this.state.scale };

    this.eventBus.publish(Events.UIEvents.UILeftMouseClick, {
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
