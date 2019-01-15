import { EventBus } from "../../EventBus";
import { DiagramState } from "../../Models/DiagramState";
import * as Events from "../../Events";
import { ScreenPosition } from "../../IO/ScreenPosition";
import { DiagramTheme, Node, Category } from "../../Models";
import { Utils } from "../../Utils";
import { NodeDefinition } from "../../Models/NodeDefinition";
import { NodeManager } from "./nodeManager";
import { ConnectionManager } from "./connectionManager";

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
export class StateManager {
  private state: DiagramState;
  private nodeManager: NodeManager;
  private connectionManager: ConnectionManager;
  getState() {
    return {
      ...this.state
    };
  }
  pureState = () => this.state;
  setCategories(categories: Category[]) {
    this.state.categories = categories;
  }
  setDefinitions(nodeDefinitions: NodeDefinition[]) {
    this.state.nodeDefinitions = nodeDefinitions;
  }

  constructor(
    private eventBus: EventBus,
    private theme: DiagramTheme,
    private connectionFunction: (input: Node, output: Node) => boolean
  ) {
    this.state = {
      links: [],
      nodes: [],
      nodeDefinitions: [],
      categories: [],
      selectedLinks: [],
      selectedNodes: [],
      hover: {},
      lastPosition: {
        x: 0,
        y: 0
      }
    };
    this.nodeManager = new NodeManager(this.state, this.eventBus, this.theme);
    this.connectionManager = new ConnectionManager(
      this.eventBus,
      this.state,
      this.connectionFunction
    );
    this.eventBus.subscribe(Events.IOEvents.MouseMove, this.hover);
    this.eventBus.subscribe(Events.IOEvents.MouseOverMove, this.hoverMenu);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.LMBPressed);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.closeMenu);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.clickMenuItem);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseUp, this.openPortMenu);
    this.eventBus.subscribe(Events.IOEvents.RightMouseUp, this.openMenu);
  }
  LMBPressed = (e: ScreenPosition) => {
    this.state.lastPosition = { ...e };
  };
  clickMenuItem = () => {
    if (this.state.menu && this.state.hover.menu) {
      const category = this.state.categories[this.state.hover.menu.index];
      if (category.action) {
        category.action!();
        this.state.menu = undefined;
        this.state.hover.menu = undefined;
      } else if (category.children) {
        this.state.categories = category.children;
        this.state.hover.menu = undefined;
      }
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
  closeMenu = (e: ScreenPosition) => {
    if (this.state.menu && !this.state.hover.menu) {
      this.state.menu = undefined;
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
  openMenu = (e: ScreenPosition) => {
    if (this.state.draw) {
      return;
    }
    const { node } = this.state.hover;
    if (!node) {
      this.state.categories = this.state.nodeDefinitions
        .filter(n => n.object)
        .map(
          n =>
            ({
              name: n.node.type,
              action: () =>
                this.nodeManager.createNode(e, {
                  ...n.node,
                  x: e.x + this.theme.menu.width / 2.0,
                  y: e.y - this.theme.node.height - 20
                })
            } as Category)
        );
      this.state.menu = {
        position: { ...e }
      };
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
  openPortMenu = (e: ScreenPosition) => {
    if (!this.state.draw) {
      return;
    }
    const { io, node } = this.state.hover;
    const { io: ioD, node: nodeD } = this.state.draw;
    if (nodeD === node && io === ioD && !this.state.menu) {
      this.state.menu = {
        position: {
          x:
            io === "i"
              ? node.x -
                this.theme.menu.width -
                this.theme.port.width -
                this.theme.menu.spacing.x
              : node.x +
                this.theme.node.width +
                this.theme.port.width +
                this.theme.menu.spacing.x,
          y: node.y
        }
      };
      let nodeDefinition = this.state.nodeDefinitions.find(
        n => n.node.type === node.type
      )!;
      console.log(this.state.nodeDefinitions);
      this.state.categories = this.state.nodeDefinitions
        .filter(n => !n.object)
        .filter(n =>
          io === "i"
            ? nodeDefinition!.acceptsInputs!.find(
                ai =>
                  ai.node.type === n.node.type ||
                  !!(n.parent && n.parent.node.type === ai.node.type)
              )
            : n.acceptsInputs &&
              n.acceptsInputs.find(
                ai =>
                  ai.node.type === node.type ||
                  !!(ai.parent && ai.parent.node.type === node.type)
              )
        )
        .map(
          n =>
            ({
              name: n.node.type,
              action: () => {
                const createdNode = this.nodeManager.createNode(
                  this.nodeManager.placeConnectedNode(node, io),
                  n.node
                );
                this.connectionManager.makeConnection(
                  io === "i" ? node : createdNode,
                  io === "o" ? node : createdNode
                );
              }
            } as Category)
        );
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
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
