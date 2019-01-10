import { EventBus } from "../../EventBus";
import { DiagramState } from "../../Models/DiagramState";
import * as Events from "../../Events";
import { ScreenPosition } from "../../IO/ScreenPosition";
import { DiagramTheme, Node, Category } from "../../Models";
import { Utils } from "../../Utils";
import { NodeDefinition } from "../../Models/NodeDefinition";

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
    this.eventBus.subscribe(Events.IOEvents.MouseMove, this.hover);
    this.eventBus.subscribe(Events.IOEvents.MouseOverMove, this.hoverMenu);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.selectNode);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.LMBPressed);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.closeMenu);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.clickMenuItem);
    this.eventBus.subscribe(
      Events.IOEvents.LeftMouseClick,
      this.startDrawingConnector
    );
    this.eventBus.subscribe(
      Events.IOEvents.LeftMouseUp,
      this.endDrawingConnector
    );
    this.eventBus.subscribe(Events.IOEvents.LeftMouseUp, this.openPortMenu);
    this.eventBus.subscribe(Events.IOEvents.RightMouseUp, this.openMenu);
    this.eventBus.subscribe(Events.IOEvents.MouseDrag, this.moveNodes);
    this.eventBus.subscribe(Events.IOEvents.MouseDrag, this.drawConnector);
  }
  LMBPressed = (e: ScreenPosition) => {
    this.state.lastPosition = { ...e };
  };
  moveNodes = (e: ScreenPosition) => {
    const { selectedNodes } = this.state;
    if (selectedNodes.length > 0) {
      for (const n of selectedNodes) {
        n.x += e.x - this.state.lastPosition.x;
        n.y += e.y - this.state.lastPosition.y;
      }
      this.state.lastPosition = { ...e };
      this.eventBus.publish(Events.DiagramEvents.NodeMoved);
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
  clickMenuItem = () => {
    if (this.state.menu && this.state.hover.menu) {
      this.state.categories[this.state.hover.menu.index].action();
      this.state.menu = undefined;
      this.state.hover.menu = undefined;
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
                this.createNode(
                  {
                    x: e.x + this.theme.menu.width / 2.0,
                    y: e.y - this.theme.node.height - 20
                  },
                  n.node
                )
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
                this.theme.node.width / 2.0 -
                this.theme.menu.width -
                50
              : node.x + this.theme.node.width / 2.0 + 50,
          y: node.y - this.theme.node.height / 2.0
        }
      };
      this.state.categories = this.state.nodeDefinitions
        .filter(n => !n.object)
        .map(
          n =>
            ({
              name: n.node.type,
              action: () => {
                const createdNode = this.createNode(
                  {
                    x:
                      io === "i"
                        ? node.x - this.theme.node.width * 2
                        : node.x + this.theme.node.width * 2,
                    y: node.y
                  },
                  n.node
                );
                this.state.links.push({
                  from: io === "o" ? node : createdNode,
                  to: io === "i" ? node : createdNode
                });
              }
            } as Category)
        );
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
  startDrawingConnector = (e: ScreenPosition) => {
    const { io, node } = this.state.hover;
    if (io && node) {
      this.state.draw = {
        node,
        io
      };
      return;
    }
    this.state.draw = undefined;
  };
  drawConnector = (e: ScreenPosition) => {
    if (!this.state.draw) {
      return;
    }
    const { io, node } = this.state.draw;
    if (!io || !node) {
      return;
    }
    this.state.drawedConnection = e;
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  makeConnection = (i: Node, o: Node) => {
    if (
      !this.connectionFunction(i, o) ||
      this.state.links.find(l => l.from === i && l.to === o) ||
      !this.state.nodeDefinitions
        .find(nd => nd.node.type === i.type)!
        .acceptsInputs.find(ai => ai.type === o.type)
    ) {
      this.state.drawedConnection = undefined;
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
      return;
    }
    console.log(`connection between ${i.id} - ${o.id}`);
    this.state.links.push({
      from: o,
      to: i
    });
    i.outputs!.push(o);
    o.inputs!.push(i);
  };
  endDrawingConnector = (e: ScreenPosition) => {
    if (!this.state.draw) {
      return;
    }
    if (this.state.hover.io && this.state.hover.io !== this.state.draw!.io) {
      const input =
        this.state.hover.io === "i"
          ? this.state.hover.node!
          : this.state.draw!.node;
      const output =
        this.state.hover.io === "o"
          ? this.state.hover.node!
          : this.state.draw!.node;
      this.makeConnection(input, output);
    }
    this.state.drawedConnection = undefined;
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
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
      if (
        Math.abs(distance.x) <
          this.theme.node.width / 2.0 + this.theme.port.width &&
        Math.abs(distance.y) < this.theme.node.height / 2.0
      ) {
        const node = n;
        const io =
          distance.x > this.theme.node.width / 2.0 && node.outputs
            ? "o"
            : distance.x < -this.theme.node.width / 2.0 && node.inputs
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
  selectNode = (e: ScreenPosition) => {
    const { node, io } = this.state.hover;
    if (node && !io) {
      console.log(e);
      if (e.shiftKey) {
        const hasIndex = this.state.selectedNodes.indexOf(node);
        if (hasIndex !== -1) {
          this.state.selectedNodes.splice(hasIndex);
          return;
        }
        this.state.selectedNodes.push(node);
      } else {
        this.state.selectedNodes = [node];
      }
    } else {
      this.state.selectedNodes = [];
    }
    this.eventBus.publish(Events.DiagramEvents.NodeSelected);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  createNode = (e: ScreenPosition, n?: Partial<Node>) => {
    const createdNode: Node = {
      name: "Person",
      id: Utils.generateId(),
      type: "type",
      description: "Enter your description",
      x: e.x,
      y: e.y,
      inputs: [],
      outputs: [],
      ...n
    };
    this.state.nodes.push(createdNode);
    this.eventBus.publish(Events.DiagramEvents.NodeCreated);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    return createdNode;
  };
}
