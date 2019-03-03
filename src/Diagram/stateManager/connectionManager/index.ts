import { EventBus } from "../../../EventBus";
import { DiagramState } from "../../../Models/DiagramState";
import * as Events from "../../../Events";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import { Node, Link, DiagramTheme } from "../../../Models";
import { Utils, NodeUtils } from "../../../Utils";
import { DataObjectInTree } from "../../../Models/QuadTree";
import { LinkUtils } from "../../../Utils/linkUtils";
import { QuadTree } from "../../../QuadTree/index";

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
    this.eventBus.subscribe(
      Events.IOEvents.ScreenRightMouseClick,
      this.openLinkMenu
    );
    this.eventBus.subscribe(
      Events.DiagramEvents.NodeDeleted,
      this.onNodesDelete
    );
  }
  loadLinks = (links: Link[]) => {
    this.state.links = links;
    this.rebuildTree();
  };
  rebuildTree = () => {
    this.state.trees.link = new QuadTree<Link>();
    this.state.links.forEach(l =>
      this.state.trees.link.insert(LinkUtils.linkToTree(l, this.theme))
    );
  };
  onNodesDelete = (nodes: Node[]) => {
    this.deleteLinks(
      this.state.links.filter(l => nodes.find(n => n === l.i || n === l.o))
    );
  };
  deleteLinks = (links: Link[]) => {
    this.state.links = this.state.links.filter(
      l => !links.find(lf => lf === l)
    );
    links.forEach(l => {
      l.o.outputs = l.o.outputs!.filter(o => o !== l.i);
      l.i.inputs = l.i.inputs!.filter(i => i !== l.o);
    });
    this.rebuildTree();
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    this.eventBus.publish(Events.DiagramEvents.LinkDeleted);
  };
  openLinkMenu = (e: ScreenPosition) => {
    const { link } = this.state.hover;
    if (!link || this.state.menu) return;
    this.state.categories = [
      {
        name: "delete",
        action: () => this.deleteLinks([link])
      }
    ];
    this.state.menu = {
      position: { ...e }
    };
  };
  startDrawingConnector = (e: ScreenPosition) => {
    const { io, node, menu } = this.state.hover;
    if (io && node && !menu) {
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
  drawConnector = (e: ScreenPosition) => {
    if (!this.state.draw) {
      return;
    }
    const { io, node } = this.state.draw;
    if (!io || !node) {
      return;
    }
    this.state.drawedConnection = { ...e };
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  cancelDrawing = () => {
    this.state.draw = undefined;
  };
  makeConnection = (i: Node, o: Node) => {
    const linkExists = () =>
      !!this.state.links.find(l => l.i === i && l.o === o);
    const correctType = () => {
      const acceptsInputs = NodeUtils.getDefinitionAcceptedInputs(
        i.definition,
        this.state.nodeDefinitions,
        o.definition
      );
      if (!acceptsInputs) {
        return false;
      }
      for (const ai of acceptsInputs) {
        if (ai.type === o.definition.type) {
          return true;
        }
        if (o.definition.parent) {
          if (ai.type === o.definition.parent.type) {
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
    const newLink: Link = {
      o: o,
      i: i,
      centerPoint: this.theme.link.defaultCenterPoint
    };
    this.state.links.push(newLink);
    i.inputs!.push(o);
    o.outputs!.push(i);
    this.state.trees.link.insert(this.linkToTree(newLink));
    this.eventBus.publish(Events.DiagramEvents.LinkCreated);
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
    if (!this.state.uiState.draggingWorld) {
      this.state.uiState.draggingWorld = true;
      return;
    }
    link.centerPoint = Utils.clamp(
      LinkUtils.calculateLinkCenterPoint(link, e, this.theme),
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
    this.eventBus.publish(Events.DiagramEvents.LinkMoved);
  };
  linkToTree = (l: Link): DataObjectInTree<Link> =>
    LinkUtils.linkToTree(l, this.theme);
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
    this.cancelDrawing();
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
}
