import { EventBus } from "../../../EventBus";
import { DiagramState } from "../../../Models/DiagramState";
import * as Events from "../../../Events";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import { DiagramTheme } from "../../../Models";
import { Utils } from "../../../Utils";

const { between } = Utils;


/**
 * StateManager:
 *
 * Main data store. Responsibilities:
 * - storing main arrays of nodes, links, etc.
 * - storing current state of diagram: selected nodes, selected links etc.
 * - methods for serializing and deserializing data
 * - listening for IO events on event bus and responding accordingly
 */
export class HoverManager {
  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    private theme: DiagramTheme
  ) {
    this.eventBus.subscribe(
      Events.IOEvents.ScreenMouseOverMove,
      this.hoverMenu
    );
    this.eventBus.subscribe(Events.IOEvents.WorldMouseMove, this.hover);
  }
  
  
  hoverMenu = (e: ScreenPosition) => {
    if (this.state.menu) {
      const distance = {
        x: e.x - this.state.menu.position.x,
        y: e.y - this.state.menu.position.y
      };
      if (distance.x > 0 && distance.y > 0) {
        if (
          distance.x < this.theme.menu.width &&
          distance.y <
            this.theme.menu.category.height * this.state.categories.length
        ) {
          const menuItem = Math.floor(
            distance.y / this.theme.menu.category.height
          );
          if (!this.state.hover.menu) {
            this.state.hover.menu = {
              index: menuItem
            };
            this.eventBus.publish(Events.DiagramEvents.RenderRequested);
          } else if (this.state.hover.menu!.index !== menuItem) {
            this.state.hover.menu!.index = menuItem;
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
    for (const n of this.state.nodes) {
      const distance = {
        x: e.x - n.x,
        y: e.y - n.y
      };
      const xBetween = between(
        -this.theme.port.width,
        this.theme.node.width + this.theme.port.width
      );
      const yBetween = between(0, this.theme.node.height);
      if (xBetween(distance.x) && yBetween(distance.y)) {
        const node = n;
        const io =
          distance.x > this.theme.node.width && node.outputs
            ? "o"
            : distance.x < 0 && node.inputs
            ? "i"
            : undefined;
        if (this.state.hover.io !== io || this.state.hover.node !== node) {
          this.state.hover = { node, io };
          this.eventBus.publish(Events.DiagramEvents.RenderRequested);
        }
        return;
      }
    }
    if (this.state.hover.io || this.state.hover.node) {
      this.state.hover = {};
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
}
