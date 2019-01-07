import { EventBus } from "../EventBus";
import { DiagramState } from "../Models/DiagramState";
import * as Events from "../Events";
import { ScreenPosition } from "../IO/ScreenPosition";
import { DiagramTheme } from "../Models";
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

  constructor(private eventBus: EventBus, private theme: DiagramTheme) {
    this.state = {
      links: [],
      nodes: [],
      categories: [],
      selectedLinks: [],
      selectedNodes: [],
      lastPosition: {
        x: 0,
        y: 0
      }
    };

    this.eventBus.subscribe(Events.IOEvents.DoubleClick, this.createNode);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.selectNode);
    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.LMBPressed);
    this.eventBus.subscribe(
      Events.IOEvents.LeftMouseUp,
      this.endDrawingConnector
    );
    this.eventBus.subscribe(Events.IOEvents.MouseOverMove, this.hoverNode);
    this.eventBus.subscribe(Events.IOEvents.MouseOverMove, this.hoverPort);
    this.eventBus.subscribe(Events.IOEvents.MouseDrag, this.moveNodes);
    this.eventBus.subscribe(Events.IOEvents.MouseDrag, this.drawConnector);
    this.eventBus.subscribe(
      Events.DiagramEvents.DrawingLink,
      this.dragHoverPort
    );
    this.eventBus.subscribe(
      Events.IOEvents.RightMouseClick,
      this.showNodeContextMenu
    );
  }
  LMBPressed = (e: ScreenPosition) => {
    this.state.lastPosition = { ...e };
  };
  hoverNode = (e: ScreenPosition) => {
    const hoverNode = this.closestNode(e);
    if (hoverNode !== this.state.hoveredNode) {
      this.state.hoveredNode = hoverNode;
      this.eventBus.publish(Events.DiagramEvents.NodeHover);
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
  dragHoverPort = (e: ScreenPosition) => {
    const hoveredNode = this.closestNode(e, true);
    if (!hoveredNode) {
      return;
    }
    const distance = e.x - hoveredNode.x;
    if (this.state.hoveredOutput) {
      if (distance < -this.theme.node.width / 2.0) {
        if (this.state.hoveredInput !== hoveredNode) {
          this.state.hoveredInput = hoveredNode;
          this.eventBus.publish(Events.DiagramEvents.RenderRequested);
        }
        return;
      }
    }
    if (this.state.hoveredInput) {
    }
  };
  hoverPort = (e: ScreenPosition) => {
    const hoveredNode = this.closestNode(e, true);
    if (!hoveredNode) {
      if (this.state.hoveredOutput || this.state.hoveredInput) {
        this.state.hoveredInput = undefined;
        this.state.hoveredOutput = undefined;
        this.eventBus.publish(Events.DiagramEvents.RenderRequested);
      }
      return;
    }
    const distance = e.x - hoveredNode.x;
    if (distance > this.theme.node.width / 2.0) {
      if (this.state.hoveredOutput !== hoveredNode) {
        this.state.hoveredOutput = hoveredNode;
        this.eventBus.publish(Events.DiagramEvents.RenderRequested);
      }
      return;
    }
    if (distance < -this.theme.node.width / 2.0) {
      if (this.state.hoveredInput !== hoveredNode) {
        this.state.hoveredInput = hoveredNode;
        this.eventBus.publish(Events.DiagramEvents.RenderRequested);
      }
      return;
    }
    if (this.state.hoveredInput || this.state.hoveredOutput) {
      this.state.hoveredInput = undefined;
      this.state.hoveredOutput = undefined;
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
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
  drawConnector = (e: ScreenPosition) => {
    if (!this.state.hoveredInput && !this.state.hoveredOutput) {
      return;
    }
    this.state.drawedConnection = e;
    this.eventBus.publish(Events.DiagramEvents.DrawingLink, e);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  endDrawingConnector = (e: ScreenPosition) => {
    if (this.state.hoveredInput && this.state.hoveredOutput) {
      console.log(
        `connection between ${this.state.hoveredInput.id} - ${
          this.state.hoveredOutput.id
        }`
      );
      this.state.links.push({
        from: this.state.hoveredInput,
        to: this.state.hoveredOutput
      });
    }
    this.state.drawedConnection = undefined;
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  closestNode = (e: ScreenPosition, port?: boolean) => {
    for (const n of this.state.nodes) {
      if (
        Math.abs(n.x - e.x) <
          this.theme.node.width / 2.0 + (port ? this.theme.port.width : 0) &&
        Math.abs(n.y - e.y) < this.theme.node.height / 2.0
      ) {
        return n;
      }
    }
  };
  selectNode = (e: ScreenPosition) => {
    const node = this.closestNode(e);
    if (node) {
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
      name: "XYZ",
      id: Utils.generateId(),
      type: "string",
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
