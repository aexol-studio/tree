import { EventBus } from "@eventBus";
import { DiagramState } from "@models";
import { ScreenPosition } from "@io";
import { DiagramTheme } from "@models";

/**
 * HoverManager:
 *
 * Hover data store.
 */
export class HoverManager {
  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    private theme: DiagramTheme
  ) {
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
      if (this.state.draw) return;
      let link;
      this.state.hover = { link };
      this.eventBus.publish("RenderRequested");
      return;
    }
    const distance = {
      x: position.x - node.x,
      y: position.y - node.y,
    };
    const io =
      distance.x > this.theme.node.width && node.outputs
        ? "o"
        : distance.x < 0 && node.inputs
        ? "i"
        : undefined;
    const type = distance.y < 0 ? true : undefined;
    if (
      this.state.hover.io !== io ||
      this.state.hover.node !== node ||
      this.state.hover.type !== type
    ) {
      this.state.hover = { node, type };
      // disable hovering the "IO" areas of node if we're
      // in a readonly mode, since it serves no purpose and
      // provides a confusing UX
      if (!this.state.isReadOnly) {
        this.state.hover.io = io;
      }
      this.eventBus.publish("RenderRequested");
    }
  };
}
