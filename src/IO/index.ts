import { EventBus } from "../EventBus";
import * as Events from "../Events";

/**
 * IO:
 *
 * Service that handles user input. Responsibilities:
 * - attach mouse and keyboard listeners
 * - broadcast IO events by putting them on the bus
 */
export class IO {
  private eventBus: EventBus;
  private lastClick = Date.now();
  private touchStartTime = Date.now();
  private elementRect?: ClientRect;
  /**
   * @param eventBus event bus to be used
   * @param element HTML <canvas> elements to put listeners on
   */
  constructor(eventBus: EventBus, private element: HTMLCanvasElement) {
    this.eventBus = eventBus;
    this.calculateClientBoundingRect();
    element.addEventListener("mouseleave", (e) => {
      e.preventDefault();
      this.eventBus.publish(Events.IOEvents.ScreenMouseLeave);
    });
    element.addEventListener("mousemove", (e) => {
      e.preventDefault();
      if (!this.elementRect) {
        return;
      }

      const mpl = this.createMouseEventPayload(e);
      this.eventBus.publish(Events.IOEvents.ScreenMouseMove, mpl);
      if (e.buttons === 1) {
        this.eventBus.publish(Events.IOEvents.ScreenMouseDrag, mpl);
      } else {
        this.eventBus.publish(Events.IOEvents.ScreenMouseOverMove, mpl);
      }
    });
    // ...
    element.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;

      const coords = this.createMouseEventPayload(e);

      this.eventBus.publish(
        Events.IOEvents.ScreenMouseWheel,
        delta,
        coords.x,
        coords.y
      );
    });
    element.addEventListener("mouseup", (e) => {
      e.preventDefault();
      if (e.which === 1) {
        this.eventBus.publish(
          Events.IOEvents.ScreenLeftMouseUp,
          this.createMouseEventPayload(e)
        );
      } else if (e.which === 3) {
        this.eventBus.publish(
          Events.IOEvents.ScreenRightMouseUp,
          this.createMouseEventPayload(e)
        );
      }
    });
    element.addEventListener("mousedown", (e) => {
      if (e.which === 1) {
        this.eventBus.publish(
          Events.IOEvents.ScreenLeftMouseClick,
          this.createMouseEventPayload(e, e.shiftKey)
        );
        const clickTime = Date.now();
        const diff = clickTime - this.lastClick;
        if (diff < 250) {
          this.eventBus.publish(
            Events.IOEvents.ScreenDoubleClick,
            this.createMouseEventPayload(e)
          );
        }
        this.lastClick = clickTime;
      } else if (e.which === 3) {
        this.eventBus.publish(
          Events.IOEvents.ScreenRightMouseClick,
          this.createMouseEventPayload(e)
        );
      }
    });
    element.addEventListener("keydown", (e) => {
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
    element.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.eventBus.publish(
        Events.IOEvents.ScreenLeftMouseClick,
        this.createTouchEventPayload(e)
      );
      this.touchStartTime = Date.now();
    });
    element.addEventListener("touchend", (e) => {
      e.preventDefault();
      const touchEndTime = Date.now();
      const diff = touchEndTime - this.touchStartTime;
      if (diff > 500) {
        this.eventBus.publish(
          Events.IOEvents.ScreenRightMouseUp,
          this.createTouchEventPayload(e));
      }
      this.touchStartTime = touchEndTime;
    });
  }

  calculateClientBoundingRect() {
    this.elementRect = this.element.getBoundingClientRect();
  }

  getReferenceRect() {
    return this.elementRect || {
      left: 0,
      top: 0,
    };
  }

  createMouseEventPayload(e: MouseEvent, shiftKey: boolean = false) {
    const referenceRect = this.getReferenceRect();

    return {
      x: e.clientX * 2 - referenceRect.left * 2,
      y: e.clientY * 2 - referenceRect.top * 2,
      shiftKey,
    };
  }

  createTouchEventPayload(e: TouchEvent, shiftKey: boolean = false) {
    const referenceRect = this.getReferenceRect();

    return {
      x: e.changedTouches[0].clientX * 2 - referenceRect.left * 2,
      y: e.changedTouches[0].clientY * 2 - referenceRect.top * 2,
      shiftKey,
    };
  }
}
