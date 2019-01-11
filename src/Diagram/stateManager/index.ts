import { EventBus } from "../../EventBus";
import { DiagramState } from "../../Models/DiagramState";
import * as Events from "../../Events";
import { ScreenPosition } from "../../IO/ScreenPosition";
import { DiagramTheme, Node, Category, Link } from "../../Models";
import { Utils } from "../../Utils";
import { NodeDefinition } from "../../Models/NodeDefinition";

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
    this.eventBus.subscribe(Events.IOEvents.RightMouseUp, this.openNodeMenu);
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
                this.createNode(e, {
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

  openNodeMenu = (e: ScreenPosition) => {
    if (this.state.draw) {
      return;
    }
    const { node } = this.state.hover;
    if (node) {
      this.state.categories = [
        {
          name: "delete",
          action: () => {
            this.deleteNodes([node]);
          }
        }
      ];
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
      );
      if (!nodeDefinition) {
        const parentNode = this.state.nodes.find(n => n.type === node.name)!;
        nodeDefinition = this.state.nodeDefinitions.find(
          n => n.node.type === parentNode.type
        );
      }
      this.state.categories = this.state.nodeDefinitions
        .filter(n => !n.object)
        .filter(n =>
          io === "i"
            ? nodeDefinition!.acceptsInputs!.find(ai => ai.type === n.node.type)
            : n.acceptsInputs &&
              n.acceptsInputs.find(ai => ai.type === node.type)
        )
        .map(
          n =>
            ({
              name: n.node.type,
              action: () => {
                const createdNode = this.createNode(
                  this.placeConnectedNode(node, io),
                  n.node
                );
                this.makeConnection(
                  io === "i" ? node : createdNode,
                  io === "o" ? node : createdNode
                );
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
    const inputNodeDefinition = this.state.nodeDefinitions.find(
      nd => nd.node.type === i.type
    )!;
    if (
      !this.connectionFunction(i, o) ||
      this.state.links.find(l => l.i === i && l.o === o) ||
      (inputNodeDefinition.acceptsInputs &&
        !inputNodeDefinition.acceptsInputs!.find(ai => ai.type === o.type))
    ) {
      this.state.drawedConnection = undefined;
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
      return;
    }
    console.log(`connection between input ${i.type} - output ${o.type}`);
    const newLink: Link = {
      o: o,
      i: i
    };
    this.state.links.push(newLink);
    i.inputs!.push(o);
    o.outputs!.push(i);
    return newLink;
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
  selectNode = (e: ScreenPosition) => {
    const { node, io } = this.state.hover;
    if (node && !io) {
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
  placeConnectedNode = (node: Node, io: "i" | "o") => {
    let x = node.x,
      y = node.y - this.theme.node.height * 2;
    const xAdd =
      this.theme.node.width + this.theme.port.width + this.theme.node.spacing.x;
    if (io === "i") {
      for (const input of node.inputs!) {
        y = input.y > y ? input.y : y;
      }
      x -= xAdd;
    }
    if (io === "o") {
      for (const output of node.outputs!) {
        y = output.y > y ? output.y : y;
      }
      x += this.theme.node.width + xAdd;
    }
    y += this.theme.node.height + this.theme.node.spacing.y;
    const tooClose = this.state.nodes.filter(
      n =>
        Math.abs(n.y - y) < this.theme.node.height &&
        Math.abs(n.x - x) < this.theme.node.width
    );
    if (tooClose.length) {
      console.log(tooClose);
      y = Math.max(...tooClose.map(tc => tc.y));
      console.log(y);
      y += this.theme.node.height + this.theme.node.spacing.y;
    }
    return { x, y };
  };
  deleteNodes = (n: Node[]) => {
    this.state.selectedNodes = this.state.selectedNodes.filter(
      node => !n.find(nn => nn === node)
    );
    this.state.nodes = this.state.nodes.filter(
      node => !n.find(nn => nn === node)
    );
    this.state.links = this.state.links.filter(
      link => !n.find(nn => nn === link.i || nn === link.o)
    );
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  createNode = (e: ScreenPosition, n?: Partial<Node>) => {
    const createdNode: Node = {
      name: "Person",
      id: Utils.generateId(),
      type: "type",
      description: "Enter your description",
      x: e.x - this.theme.node.width / 2.0,
      y: e.y - this.theme.node.height / 2.0,
      inputs: [],
      outputs: [],
      ...n
    };
    if (n && n.type) {
      const nodeDefinition = this.state.nodeDefinitions.find(
        nd => nd.node.type === n.type
      );
      if (nodeDefinition && nodeDefinition.object) {
        const ObjectInstanceDefinition = this.state.nodeDefinitions.find(
          nd => nd.node.type === n.name
        );
        if (!ObjectInstanceDefinition) {
          this.state.nodeDefinitions.push({
            ...nodeDefinition,
            object: undefined,
            main: undefined,
            node: {
              ...nodeDefinition.node,
              inputs: [],
              outputs: [],
              type: n.name!
            }
          });
          this.state.nodeDefinitions = this.state.nodeDefinitions.map(nd => {
            let { acceptsInputs } = nd;
            if (
              acceptsInputs &&
              acceptsInputs.find(ai => ai.type === nodeDefinition.node.type)
            ) {
              acceptsInputs = [
                ...acceptsInputs,
                {
                  type: n.name!
                }
              ];
            }
            return {
              ...nd,
              acceptsInputs
            };
          });
        }
      }
      // if (!this.state.nodeDefinitions.find(nd => nd.node.type === n.type)) {
      //   const parentNode = this.state.nodes.find(nd => nd.type === n.name)!;
      //   const parentNodeDefinition = this.state.nodeDefinitions.find(
      //     nd => nd.node.type === parentNode.type
      //   )!;
      //   this.state.nodeDefinitions.push({
      //     ...parentNode,
      //     node: {
      //       ...parentNodeDefinition.node,
      //       type: n.type!
      //     }
      //   });
      //   this.state.nodeDefinitions = this.state.nodeDefinitions.map(nd => {
      //     let { acceptsInputs } = nd;
      //     if (
      //       acceptsInputs &&
      //       acceptsInputs.find(ai => ai.type === parentNode.type)
      //     ) {
      //       acceptsInputs = [
      //         ...acceptsInputs,
      //         {
      //           type: n.name!
      //         }
      //       ];
      //     }
      //     return {
      //       ...nd,
      //       acceptsInputs
      //     };
      //   });
      // }
    }
    this.state.nodes.push(createdNode);
    this.eventBus.publish(Events.DiagramEvents.NodeCreated);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    return createdNode;
  };
}
