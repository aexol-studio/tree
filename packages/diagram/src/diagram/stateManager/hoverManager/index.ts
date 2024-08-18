import { EventBus } from "@/eventBus";
import { DiagramState } from "@/models";
import { ScreenPosition } from "@/io";

/**
 * HoverManager:
 *
 * Hover data store.
 */
export class HoverManager {
  constructor(private state: DiagramState, private eventBus: EventBus) {
    this.eventBus.subscribe("WorldMouseOverMove", this.hover);
    this.eventBus.subscribe("PickRequested", this.hover);
  }

  hover = ({ position }: { position: ScreenPosition }) => {
    const node = this.state.trees.node.pick(position);
    if (!node) {
      if (this.state.hover.node) {
        this.state.hover = {};
        this.eventBus.publish("RenderRequested");
        return;
      }
      return;
    }
    const distance = {
      x: position.x - node.x,
      y: position.y - node.y,
    };
    const type = distance.y < 0 ? true : undefined;
    if (this.state.hover.node !== node || this.state.hover.type !== type) {
      this.state.hover = { node, type };
      this.eventBus.publish("RenderRequested");
    }
  };
}
