import { DiagramEvents, IOEvents } from "../Events";

/**
 * Event bus:
 *
 * Publish-subscribe event bus. Responsibilities:
 * - providing possibility of subscribing to particular topics
 * - providing possibility of publishing events to particular topics
 */
export type Topic = DiagramEvents | IOEvents;
export class EventBus {

  private topics: { [key: string]: Function[] } = {};
  private externalSubscribers: { [key: string]: Function[] } = {};

  subscribe(topic: Topic, callback: Function) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }

    this.topics[topic].push(callback);
  }

  publish<T>(topic: Topic, ...args: T[]) {
    [
      ...(this.topics[topic] || []),
      ...(this.externalSubscribers[topic] || []),
    ].forEach((callback, index) => {
      callback(...args);
    });
  }

  on(topic: Topic | string, callback: Function) {
    if (!this.externalSubscribers[topic]) {
      this.externalSubscribers[topic] = [];
    }

    this.externalSubscribers[topic].push(callback);

    return () => this.off(topic, callback);
  }

  off(topic: Topic | string, callback: Function) {
    if (!this.externalSubscribers[topic]) {
      return;
    }

    this.externalSubscribers[topic] = this.externalSubscribers[topic].filter(existingCallback => existingCallback !== callback);
  }
}
