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
  private elementRect?: ClientRect;
  /**
   * @param eventBus event bus to be used
   * @param element HTML <canvas> elements to put listeners on
   */
  constructor(eventBus: EventBus, private element: HTMLCanvasElement) {
    this.eventBus = eventBus;
    this.calculateClientBoundingRect();
    element.addEventListener("mouseleave", e => {
      e.preventDefault();
      this.eventBus.publish(Events.IOEvents.ScreenMouseLeave);
    });
    element.addEventListener("mousemove", e => {
      e.preventDefault();
      if (!this.elementRect) {
        return;
      }
      this.currentScreenPosition.x = e.clientX * 2 - this.elementRect.left * 2;
      this.currentScreenPosition.y = e.clientY * 2 - this.elementRect.top * 2;
      const mpl = this.createMouseEventPayload();
      this.eventBus.publish(Events.IOEvents.ScreenMouseMove, mpl);
      if (e.buttons === 1) {
        this.eventBus.publish(Events.IOEvents.ScreenMouseDrag, mpl);
      } else {
        this.eventBus.publish(Events.IOEvents.ScreenMouseOverMove, mpl);
      }
    });
    // ...
    element.addEventListener("wheel", e => {
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;

      const coords = this.createMouseEventPayload();

      this.eventBus.publish(
        Events.IOEvents.ScreenMouseWheel,
        delta,
        coords.x,
        coords.y
      );
    });
    element.addEventListener("mouseup", e => {
      e.preventDefault();
      if (e.which === 1) {
        this.eventBus.publish(
          Events.IOEvents.ScreenLeftMouseUp,
          this.createMouseEventPayload()
        );
      } else if (e.which === 3) {
        this.eventBus.publish(
          Events.IOEvents.ScreenRightMouseUp,
          this.createMouseEventPayload()
        );
      }
    });
    element.addEventListener("mousedown", e => {
      if (e.which === 1) {
        this.eventBus.publish(
          Events.IOEvents.ScreenLeftMouseClick,
          this.createMouseEventPayload({
            shiftKey: e.shiftKey
          })
        );
        const clickTime = Date.now();
        const diff = clickTime - this.lastClick;
        if (diff < 250) {
          this.eventBus.publish(
            Events.IOEvents.ScreenDoubleClick,
            this.createMouseEventPayload()
          );
        }
        this.lastClick = clickTime;
      } else if (e.which === 3) {
        this.eventBus.publish(
          Events.IOEvents.ScreenRightMouseClick,
          this.createMouseEventPayload()
        );
      }
    });
    element.addEventListener("keydown", e => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (e.key === "m") {
        this.eventBus.publish(Events.IOEvents.MPressed);
      }
      if (e.key === "Delete") {
        this.eventBus.publish(Events.IOEvents.DeletePressed);
      }
      if (e.key === "Backspace") {
        this.eventBus.publish(Events.IOEvents.BackspacePressed);
      }
      if (e.key === "z" && ctrl && !e.shiftKey) {
        this.eventBus.publish(Events.DiagramEvents.UndoRequested);
      }
      if (e.key === "z" && ctrl && e.shiftKey) {
        this.eventBus.publish(Events.DiagramEvents.RedoRequested);
      }
    });
  }

  calculateClientBoundingRect() {
    this.elementRect = this.element.getBoundingClientRect();
  }

  createMouseEventPayload(e: Partial<ScreenPosition> = {}) {
    return {
      ...this.currentScreenPosition,
      ...e
    };
  }
}
