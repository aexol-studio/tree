import { EventBus } from "../EventBus";
import { DiagramState } from "../Models/DiagramState";
import * as Events from "../Events";
import { ScreenPosition } from "../IO/ScreenPosition";
import { DiagramTheme, Node } from "../Models";
import { Utils } from "../Utils";

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
  setCategories(categories: any[]) {
    this.state.categories = categories;
    // ... update the data
  }

  constructor(
    private eventBus: EventBus,
    private theme: DiagramTheme,
    private connectionFunction: (input: Node, output: Node) => boolean
  ) {
    this.state = {
      links: [],
      nodes: [],
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
    this.eventBus.subscribe(Events.IOEvents.DoubleClick, this.createNode);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.selectNode);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.LMBPressed);
    this.eventBus.subscribe(
      Events.IOEvents.LeftMouseClick,
      this.startDrawingConnector
    );
    this.eventBus.subscribe(
      Events.IOEvents.LeftMouseUp,
      this.endDrawingConnector
    );
    this.eventBus.subscribe(Events.IOEvents.LeftMouseUp, this.openPortMenu);
    this.eventBus.subscribe(Events.IOEvents.MouseDrag, this.moveNodes);
    this.eventBus.subscribe(Events.IOEvents.MouseDrag, this.drawConnector);
    this.eventBus.subscribe(
      Events.IOEvents.RightMouseClick,
      this.showNodeContextMenu
    );
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
  openPortMenu = (e: ScreenPosition) => {
    if (!this.state.draw) {
      return;
    }
    const { io, node } = this.state.hover;
    const { io: ioD, node: nodeD } = this.state.draw;
    if (nodeD === node && io === ioD) {
      console.log("Ipen port")
      //Open Port Menu
    }
  };
  startDrawingConnector = (e: ScreenPosition) => {
    const { io, node } = this.state.hover;
    if (io && node) {
      this.state.draw = {
        node,
        io
      };
    }
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
  endDrawingConnector = (e: ScreenPosition) => {
    if (this.state.hover.io && this.state.hover.io !== this.state.draw!.io) {
      const input =
        this.state.hover.io === "i"
          ? this.state.hover.node!
          : this.state.draw!.node;
      const output =
        this.state.hover.io === "o"
          ? this.state.hover.node!
          : this.state.draw!.node;
      if (
        !this.connectionFunction(input, output) ||
        this.state.links.find(l => l.from === output && l.to === input)
      ) {
        this.state.drawedConnection = undefined;
        this.eventBus.publish(Events.DiagramEvents.RenderRequested);
        return;
      }

      console.log(`connection between ${output.id} - ${input.id}`);
      this.state.links.push({
        from: output,
        to: input
      });
    }
    this.state.drawedConnection = undefined;
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
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
          distance.x > this.theme.node.width / 2.0
            ? "o"
            : distance.x < -this.theme.node.width / 2.0
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
      const hasIndex = this.state.selectedNodes.indexOf(node);
      if (hasIndex !== -1) {
        this.state.selectedNodes.splice(hasIndex);
        return;
      }
      this.state.selectedNodes.push(node);
    } else {
      this.state.selectedNodes = [];
    }
    this.eventBus.publish(Events.DiagramEvents.NodeSelected);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  createNode = (e: ScreenPosition) => {
    this.state.nodes.push({
      name: "Person",
      id: Utils.generateId(),
      type: "type",
      description:
        "Person Class - responsible for user profile detatils and extra props.",
      x: e.x,
      y: e.y
    });
    this.eventBus.publish(Events.DiagramEvents.NodeCreated);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };

  showNodeContextMenu() {
    // ... something happened, e.g. node was moved
  }
}
