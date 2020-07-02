import { EventBus } from "@eventBus";
import { DiagramState } from "@models";
import * as Events from "@events";
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
    private theme: DiagramTheme,
    private disableLinkOperations: boolean
  ) {
    this.eventBus.subscribe(Events.IOEvents.WorldMouseOverMove, this.hover);
    this.eventBus.subscribe(Events.DiagramEvents.PickRequested, this.hover);
  }

  somethingHovered = () => {
    for (const k of Object.keys(this.state.hover))
      if ((this.state.hover.valueOf() as any)[k]) return true;
  };
  hover = (e: ScreenPosition) => {
    const node = this.state.trees.node.pick(e);
    if (!node) {
      if (this.state.draw) return;
      let link;
      if (!this.disableLinkOperations) {
        link = this.state.trees.link.pick(e);
      }
      this.state.hover = { link };
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
      return;
    }
    const distance = {
      x: e.x - node.x,
      y: e.y - node.y,
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
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
}
