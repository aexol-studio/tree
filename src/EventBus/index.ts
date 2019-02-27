import { DiagramEvents, IOEvents } from "../Events";

/**
 * Event bus:
 *
 * Publish-subscribe event bus. Responsibilities:
 * - providing possibility of subscribing to particular topics
 * - providing possibility of publishing events to particular topics
 */
export type EventBusListener = <T extends any[]>(...args: T) => {};
type Topic = DiagramEvents | IOEvents;
export class EventBus {
  private eventListener?: EventBusListener;
  private topics: { [key: string]: Function[] } = {};
  setEventListener(fn: EventBusListener) {
    this.eventListener = fn;
  }
  subscribe(topic: Topic, callback: Function) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }

    this.topics[topic].push(callback);
  }

  publish<T>(topic: Topic, ...args: T[]) {
    if (!this.topics[topic]) {
      return;
    }
    this.topics[topic].forEach((callback, index) => {
      callback(...args);
    });
    this.eventListener && this.eventListener(topic, ...args);
  }
}
