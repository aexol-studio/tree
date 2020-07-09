import { EventBus } from "@eventBus";
import { DiagramState, Category } from "@models";
import { ScreenPosition } from "@io";
import { Node, Link, DiagramTheme, DataObjectInTree } from "@models";
import { Utils, NodeUtils } from "@utils";
import { LinkUtils } from "@utils";
import { QuadTree } from "@quadTree";

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
    this.eventBus.subscribe("WorldLeftMouseClick", this.startDrawingConnector);
    this.eventBus.subscribe("WorldMouseDragEnd", this.endDrawingConnector);
    this.eventBus.subscribe("NodeMoved", this.onNodeMoved);
    this.eventBus.subscribe("WorldMouseDragEnd", this.movedLink);
    this.eventBus.subscribe("ScreenRightMouseClick", this.openLinkMenu);
    this.eventBus.subscribe("NodeDeleted", this.onNodesDelete);
  }
  loadLinks = (links: Link[]) => {
    this.state.links = links;
    this.rebuildTree();
  };
  rebuildTree = () => {
    this.state.trees.link = new QuadTree<Link>();
    this.state.links
      .filter((l) => !(l.i.hidden || l.o.hidden))
      .forEach((l) =>
        this.state.trees.link.insert(LinkUtils.linkToTree(l, this.theme))
      );
  };
  onNodesDelete = ({ nodes }: { nodes: Node[] }) => {
    this.deleteLinks(
      this.state.links.filter((l) => nodes.find((n) => n === l.i || n === l.o))
    );
  };
  deleteLinks = (links: Link[]) => {
    this.state.links = this.state.links.filter(
      (l) => !links.find((lf) => lf === l)
    );
    links.forEach((l) => {
      l.o.outputs = l.o.outputs?.filter((o) => o !== l.i);
      l.i.inputs = l.i.inputs?.filter((i) => i !== l.o);
    });
    this.rebuildTree();
    this.eventBus.publish("RenderRequested");
    this.eventBus.publish("LinksDeleted", { links });
  };
  openLinkMenu = () => {
    const { link } = this.state.hover;
    if (this.state.isReadOnly || !link) return;
    const menuCategories: Category[] = [
      {
        name: "delete",
        action: () => this.deleteLinks([link]),
      },
    ];
    this.eventBus.publish("MenuRequested", {
      e: this.state.uiState.lastDragPosition,
      title: `Edit link`,
      categories: menuCategories,
    });
  };
  startDrawingConnector = ({ position }: { position: ScreenPosition }) => {
    if (this.state.isReadOnly) return;
    const { io, node, menu } = this.state.hover;
    if (io && node && !menu) {
      this.state.draw = {
        node,
        io,
        initialPos: position,
      };
      this.state.uiState.draggingElements = true;
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
    this.eventBus.publish("RenderRequested");
  };
  cancelDrawing = () => {
    this.state.draw = undefined;
  };
  makeConnection = (i: Node, o: Node) => {
    const linkExists = () =>
      !!this.state.links.find((l) => l.i === i && l.o === o);
    const correctType = () => {
      const acceptsInputs = NodeUtils.getDefinitionAcceptedInputs(
        i.definition,
        this.state.nodeDefinitions,
        o.definition,
        this.state.nodes,
        i
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
      this.eventBus.publish("RenderRequested");
      return;
    }
    const newLink: Link = {
      o: o,
      i: i,
      centerPoint: this.theme.link.defaultCenterPoint,
      circularReference: i.id === o.id,
    };
    this.state.links.push(newLink);
    if (!i.inputs || !o.outputs) {
      throw new Error("Cannot make a connection");
    }
    i.inputs.push(o);
    o.outputs.push(i);
    this.state.trees.link.insert(this.linkToTree(newLink));
    this.eventBus.publish("LinkCreated", { link: newLink });
    return newLink;
  };
  onNodeMoved = ({ selectedNodes }: { selectedNodes: Node[] }) => {
    const links = this.state.links.filter((l) =>
      selectedNodes.find((n) => n === l.i || n === l.o)
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
    if (!this.state.uiState.draggingElements) {
      this.state.uiState.draggingElements = true;
      return;
    }
    link.centerPoint = Utils.clamp(
      LinkUtils.calculateLinkCenterPoint(link, e, this.theme),
      0.1,
      0.9
    );
    this.state.uiState.lastDragPosition = { ...e };
    this.eventBus.publish("RenderRequested");
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
        x: this.state.uiState.lastDragPosition.x,
        y: this.state.uiState.lastDragPosition.y,
      },
      linkTree.bb
    );
    this.eventBus.publish("LinkMoved", { link });
  };
  linkToTree = (l: Link): DataObjectInTree<Link> =>
    LinkUtils.linkToTree(l, this.theme);
  endDrawingConnector = () => {
    if (!this.state.draw) {
      return;
    }
    if (
      this.state.hover.io &&
      this.state.hover.io !== this.state.draw.io &&
      this.state.hover.node &&
      this.state.draw.node
    ) {
      const input =
        this.state.hover.io === "i"
          ? this.state.hover.node
          : this.state.draw.node;
      const output =
        this.state.hover.io === "o"
          ? this.state.hover.node
          : this.state.draw.node;
      this.makeConnection(input, output);
    }
    this.cancelDrawing();
    this.eventBus.publish("RenderRequested");
  };
}
