import { EventBus } from "../EventBus";
import * as Events from "../Events";
import { ScreenPosition } from "./ScreenPosition";

/**
 * IO:
 *
 * Service that handles user input. Responsibilities:
 * - attach mouse and keyboard listeners
 * - broadcast IO events by putting them on the bus
 */
export class IO {
  private eventBus: EventBus;
  private currentScreenPosition: ScreenPosition = { x: 0, y: 0 };
  private lastClick = Date.now();
  private leftMouseButtonDown: boolean = false;
  /**
   * @param eventBus event bus to be used
   * @param element HTML <canvas> elements to put listeners on
   */
  constructor(eventBus: EventBus, element: HTMLCanvasElement) {
    this.eventBus = eventBus;

    element.addEventListener("mousemove", e => {
      e.preventDefault();
      this.currentScreenPosition.x = e.clientX * 2;
      this.currentScreenPosition.y = e.clientY * 2;
      const mpl = this.createMouseEventPayload();
      this.eventBus.publish(Events.IOEvents.MouseMove, mpl);
      if (this.leftMouseButtonDown) {
        this.eventBus.publish(Events.IOEvents.MouseDrag, mpl);
      } else {
        this.eventBus.publish(Events.IOEvents.MouseOverMove, mpl);
      }
    });
    // ...
    element.addEventListener("mouseup", e => {
      e.preventDefault();
      if (e.which === 1) {
        this.leftMouseButtonDown = false;
        this.eventBus.publish(
          Events.IOEvents.LeftMouseUp,
          this.createMouseEventPayload()
        );
      } else if (e.which === 3) {
        this.eventBus.publish(
          Events.IOEvents.RightMouseUp,
          this.createMouseEventPayload()
        );
      }
    });
    element.addEventListener("mousedown", e => {
      if (e.which === 1) {
        this.leftMouseButtonDown = true;
        this.eventBus.publish(
          Events.IOEvents.LeftMouseClick,
          this.createMouseEventPayload({
            shiftKey: e.shiftKey
          })
        );
        const clickTime = Date.now();
        const diff = clickTime - this.lastClick;
        if (diff < 250) {
          this.eventBus.publish(
            Events.IOEvents.DoubleClick,
            this.createMouseEventPayload()
          );
        }
        this.lastClick = clickTime;
      } else if (e.which === 3) {
        this.eventBus.publish(
          Events.IOEvents.RightMouseClick,
          this.createMouseEventPayload()
        );
      }
    });
    element.addEventListener("keydown", e => {
      
      if (e.key === "m") {
        this.eventBus.publish(Events.IOEvents.MPressed);
      }
      if (e.key === "delete") {
        this.eventBus.publish(Events.IOEvents.DeletePressed);
      }
    });
  }

  createMouseEventPayload(e: Partial<ScreenPosition> = {}) {
    return {
      ...this.currentScreenPosition,
      ...e
    };
  }
}
