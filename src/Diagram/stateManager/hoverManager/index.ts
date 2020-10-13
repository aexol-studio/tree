import { EventBus } from "@eventBus";
import { DiagramState } from "@models";
import { ScreenPosition } from "@io";

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

  somethingHovered = () => {
    for (const k of Object.keys(this.state.hover))
      if ((this.state.hover.valueOf() as any)[k]) return true;
  };
  hover = ({ position }: { position: ScreenPosition }) => {
    const node = this.state.trees.node.pick(position);
    if (!node) {
      let link;
      this.state.hover = { link };
      this.eventBus.publish("RenderRequested");
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
