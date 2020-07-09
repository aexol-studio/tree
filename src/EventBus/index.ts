import {
  DiagramEvents,
  IOEvents,
  DiagramEventsPayloads,
  IOEventsPayloads,
} from "@events";

/**
 * Event bus:
 *
 * Publish-subscribe event bus. Responsibilities:
 * - providing possibility of subscribing to particular topics
 * - providing possibility of publishing events to particular topics
 */
export type Topic = DiagramEvents | IOEvents;
export type TopicPayload = DiagramEventsPayloads & IOEventsPayloads;
export type TopicArgs<T> = T extends keyof TopicPayload
  ? TopicPayload[T]
  : never;

export class EventBus {
  private topics: { [key: string]: Function[] } = {};
  private externalSubscribers: { [key: string]: Function[] } = {};
  private que: Array<{ topic: Topic; args?: any }> = [];
  subscribe<T extends Topic>(topic: T, callback: (args: TopicArgs<T>) => any) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }

    this.topics[topic].push(callback);
  }

  publish<T extends Topic>(topic: T, args?: TopicArgs<T>) {
    this.que.push({
      topic,
      args,
    });
    if (this.que.length > 1) {
      return;
    }
    while (this.que.length > 0) {
      const [q] = this.que;
      const all = [
        ...(this.topics[q.topic] || []),
        ...(this.externalSubscribers[q.topic] || []),
      ];
      all.forEach((callback) => callback(q.args));
      this.que.shift();
    }
  }

  on<T extends Topic>(topic: T, callback: (args: TopicArgs<T>) => any) {
    if (!this.externalSubscribers[topic]) {
      this.externalSubscribers[topic] = [];
    }

    this.externalSubscribers[topic].push(callback);

    return () => this.off(topic, callback);
  }

  off<T extends Topic>(topic: T, callback: (args: TopicArgs<T>) => any) {
    if (!this.externalSubscribers[topic]) {
      return;
    }

    this.externalSubscribers[topic] = this.externalSubscribers[topic].filter(
      (existingCallback) => existingCallback !== callback
    );
  }
}
