import { EventBus } from "../EventBus";
import * as Events from '../Events';

/**
 * IO:
 *
 * Service that handles user input. Responsibilities:
 * - attach mouse and keyboard listeners
 * - broadcast IO events by putting them on the bus
 */
export class IO {
  private eventBus: EventBus;
  private currentScreenPosition: { x: number, y: number } = {x: 0, y: 0};

  /**
   * @param eventBus event bus to be used
   * @param element HTML <canvas> elements to put listeners on
   */
  constructor(eventBus: EventBus, element: HTMLCanvasElement) {
    this.eventBus = eventBus;

    element.addEventListener('mousemove', (e) => {
      this.currentScreenPosition.x = e.clientX * 2;
      this.currentScreenPosition.y = e.clientY * 2;
    });
    // ...
    element.addEventListener('mousedown', (e) => {
      if (e.which === 1) {
        this.eventBus.publish(Events.IOEvents.LeftMouseClick, this.createMouseEventPayload());
      } else if (e.which === 3) {
        this.eventBus.publish(Events.IOEvents.RightMouseClick, this.createMouseEventPayload());
      }

    });

    element.addEventListener('keypress', (e) => {
      if (e.key === " ") {
        this.eventBus.publish(Events.IOEvents.SpacebarPressed, this.createMouseEventPayload());
      }

      if (e.key === "m") {
        this.eventBus.publish(Events.IOEvents.MPressed);
      }
    });
  }

  createMouseEventPayload() {
    return {
      ...this.currentScreenPosition,
    };
  }
}
