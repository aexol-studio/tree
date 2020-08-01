import { EventBus } from "@eventBus";

declare global {
  interface Window {
    graphsource: EventBus;
  }
}
