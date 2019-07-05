import { EventBus } from "../../../EventBus";
import { DiagramState } from "../../../Models/DiagramState";
import * as Events from "../../../Events";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import { DiagramTheme } from "../../../Models";

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
  hoverMenu = (e: ScreenPosition) => {
    if (this.state.menu) {
      const distance = {
        x: e.x - this.state.menu.position.x,
        y: e.y - this.state.menu.position.y
      };
      if (distance.x > 0 && distance.y > 0) {
        if (
          distance.x < this.theme.menu.maxWidth &&
          distance.y < this.theme.menu.maxHeight
        ) {
          if (!this.state.hover.menu) {
            this.state.hover = {
              menu: true
            };
            this.eventBus.publish(Events.DiagramEvents.RenderRequested);
          }
          return;
        }
      }
    }
    if (this.state.hover.menu) {
      this.state.hover.menu = undefined;
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
  somethingHovered = () => {
    for (const k of Object.keys(this.state.hover))
      if (!!(this.state.hover.valueOf() as any)[k]) return true;
  };
  hover = (e: ScreenPosition) => {
    const node = this.state.trees.node.pick(e);
    if (!node) {
      if (this.state.draw) return;
      if (!this.disableLinkOperations) {
        const link = this.state.trees.link.pick(e);
        this.state.hover = { link };
      } else {
        this.state.hover = {};
      }
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
      return;
    }
    const distance = {
      x: e.x - node.x,
      y: e.y - node.y
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
      this.state.hover = { node, io, type };
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
}
