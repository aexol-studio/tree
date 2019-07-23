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
  private que: Array<{ topic: Topic; args: any[] }> = [];
  subscribe(topic: Topic, callback: Function) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }

    this.topics[topic].push(callback);
  }

  publish(topic: Topic, ...args: any[]) {
    this.que.push({
      topic,
      args
    });
    if (this.que.length > 1) {
      return;
    }
    while (this.que.length > 0) {
      const [q] = this.que;
      const all = [
        ...(this.topics[q.topic] || []),
        ...(this.externalSubscribers[q.topic] || [])
      ];
      all.forEach(callback => callback(...q.args));
      this.que.shift()!;
    }
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

    this.externalSubscribers[topic] = this.externalSubscribers[topic].filter(
      existingCallback => existingCallback !== callback
    );
  }
}
