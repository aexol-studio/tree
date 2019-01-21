import { EventBus } from "../../../EventBus";
import { DiagramState } from "../../../Models/DiagramState";
import * as Events from "../../../Events";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import { Node, Link, DiagramTheme } from "../../../Models";
import { Utils } from "../../../Utils";
import { DataObjectInTree } from "../../../Models/QuadTree";

/**
 * ConnectionManager:
 *
 * Connection Manager is for connections:
 */
export class ConnectionManager {
  constructor(
    private eventBus: EventBus,
    private state: DiagramState,
    private theme: DiagramTheme,
    private connectionFunction: (input: Node, output: Node) => boolean
  ) {
    this.eventBus.subscribe(
      Events.IOEvents.WorldLeftMouseClick,
      this.startDrawingConnector
    );
    this.eventBus.subscribe(
      Events.IOEvents.WorldMouseDragEnd,
      this.endDrawingConnector
    );
    this.eventBus.subscribe(Events.DiagramEvents.NodeMoved, this.onNodeMoved);
    this.eventBus.subscribe(Events.IOEvents.WorldMouseDragEnd, this.movedLink);
  }
  startDrawingConnector = (e: ScreenPosition) => {
    const { io, node } = this.state.hover;
    if (io && node) {
      this.state.draw = {
        node,
        io,
        initialPos: e
      };
      this.state.uiState!.draggingWorld = true;
      return;
    }
    this.state.draw = undefined;
  };
  drawConnector = (e: ScreenPosition, pan: ScreenPosition) => {
    if (!this.state.draw) {
      return;
    }
    const { io, node } = this.state.draw;
    if (!io || !node) {
      return;
    }
    this.state.drawedConnection = { x: e.x - pan.x, y: e.y - pan.y };
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  makeConnection = (i: Node, o: Node) => {
    const linkExists = () =>
      !!this.state.links.find(l => l.i === i && l.o === o);
    const correctType = () => {
      const acceptsInputs = Utils.getDefinitionAcceptedInputs(i.definition);
      if (!acceptsInputs) {
        return false;
      }
      for (const ai of acceptsInputs) {
        if (ai.node.type === o.type) {
          return true;
        }
        if (o.definition.parent) {
          if (ai.node.type === o.definition.parent.node.type) {
            return true;
          }
        }
      }
      return false;
    };
    if (!this.connectionFunction(i, o) || linkExists() || !correctType()) {
      this.state.drawedConnection = undefined;
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
      return;
    }
    console.log(`connection between input ${i.type} - output ${o.type}`);
    const newLink: Link = {
      o: o,
      i: i,
      centerPoint: this.theme.link.defaultCenterPoint
    };
    this.state.links.push(newLink);
    i.inputs!.push(o);
    o.outputs!.push(i);
    this.state.trees.link.insert(this.linkToTree(newLink));
    return newLink;
  };
  onNodeMoved = (nodes: Node[]) => {
    const links = this.state.links.filter(l =>
      nodes.find(n => n === l.i || n === l.o)
    );
    for (const l of links.map(this.linkToTree))
      this.state.trees.link.update(
        l.data,
        { x: l.bb.min.x, y: l.bb.min.y },
        l.bb
      );
  };
  moveLink = (e: ScreenPosition) => {
    const { link } = this.state.hover;
    if (!link) {
      return;
    }
    this.state.uiState.draggingWorld = true;
    link.centerPoint = Utils.clamp(
      (e.x - link.o.x - this.theme.node.width) /
        (link.i.x - (this.theme.node.width + link.o.x)),
      0.1,
      0.9
    );

    this.state.uiState!.lastDragPosition = { ...e };
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  movedLink = () => {
    const { link } = this.state.hover;
    if (!link) {
      return;
    }
    const linkTree = this.linkToTree(link);
    this.state.trees.link.update(
      link,
      {
        x: this.state.uiState!.lastDragPosition!.x,
        y: this.state.uiState!.lastDragPosition!.y
      },
      linkTree.bb
    );
  };
  linkToTree = (l: Link): DataObjectInTree<Link> => {
    const { o, i, centerPoint } = l;
    const xCenter =
      o.x > i.x
        ? i.x + (o.x - i.x) * centerPoint
        : o.x +
          (i.x - o.x + this.theme.node.width + this.theme.port.width) *
            centerPoint;
    console.log(xCenter);
    return {
      data: l,
      bb: {
        min: {
          x: xCenter - 15,
          y: o.y <= i.y ? o.y : i.y
        },
        max: {
          x: xCenter + 15,
          y: o.y > i.y ? o.y : i.y
        }
      }
    };
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
}
