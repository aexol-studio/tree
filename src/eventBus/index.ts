import { DiagramEvents } from '@/possibleEvents';

/**
 * Event bus:
 *
 * Publish-subscribe event bus. Responsibilities:
 * - providing possibility of subscribing to particular topics
 * - providing possibility of publishing events to particular topics
 */
export class EventBus {
  private topics: { [key: string]: Function[] } = {};
  private externalSubscribers: { [key: string]: Function[] } = {};
  private que: Array<{ topic: keyof DiagramEvents; args?: unknown }> = [];
  subscribe<T extends keyof DiagramEvents>(
    topic: T,
    callback: (args: DiagramEvents[T]) => void,
  ) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }

    this.topics[topic].push(callback);
  }

  publish<T extends keyof DiagramEvents>(topic: T, args?: DiagramEvents[T]) {
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

  on<T extends keyof DiagramEvents>(
    topic: T,
    callback: (args: DiagramEvents[T]) => void,
  ) {
    if (!this.externalSubscribers[topic]) {
      this.externalSubscribers[topic] = [];
    }

    this.externalSubscribers[topic].push(callback);

    return () => this.off(topic, callback);
  }

  off<T extends keyof DiagramEvents>(
    topic: T,
    callback: (args: DiagramEvents[T]) => void,
  ) {
    if (!this.externalSubscribers[topic]) {
      return;
    }

    this.externalSubscribers[topic] = this.externalSubscribers[topic].filter(
      (existingCallback) => existingCallback !== callback,
    );
  }
}
