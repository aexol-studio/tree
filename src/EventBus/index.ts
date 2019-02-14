/**
 * Event bus:
 *
 * Publish-subscribe event bus. Responsibilities:
 * - providing possibility of subscribing to particular topics
 * - providing possibility of publishing events to particular topics
 */
export class EventBus {
  private topics: { [key: string]: Function[] } = {};

  subscribe(topic: string, callback: Function) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }

    this.topics[topic].push(callback);
  }

  publish<T>(topic: string, ...args: T[]) {
    if (!this.topics[topic]) {
      return;
    }
    this.topics[topic].forEach((callback, index) => {
      callback(...args);
    });
  }
}
