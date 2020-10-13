import { EventBus } from "@eventBus";
import { ScreenPosition } from "@io";
import { DiagramState, DiagramTheme, Node } from "@models";
import { NodeUtils } from "@utils";
import { QuadTree } from "@quadTree";

/**
 * NodeManager:
 *
 * Main nodes operation class
 */
export class NodeManager {
  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    private theme: DiagramTheme
  ) {
    this.eventBus.subscribe("WorldLeftMouseClick", this.selectNode);
    this.eventBus.subscribe("WorldLeftMouseClick", this.goToNodeType);
  }
  rebuildTree = () => {
    this.state.trees.node = new QuadTree<Node>();
    this.state.nodes
      .filter((n) => !n.hidden)
      .forEach((n) =>
        this.state.trees.node.insert(NodeUtils.createTreeNode(n, this.theme))
      );
  };
  loadNodes = (nodes: Node[]) => {
    this.state.nodes = nodes;
    this.state.selectedNodes = [];
    this.rebuildTree();
  };
  beautifyNodesInPlace = (node: Node) => {
    const graph = NodeUtils.graphFromNode(node, this.state.nodes);
    const {
      center: { x, y },
    } = graph;
    const graph2 = NodeUtils.positionGraph(graph, this.theme);
    const diff = {
      x: x - graph2.center.x,
      y: y - graph2.center.y,
    };
    graph2.nodes.forEach((n) => {
      n.x += diff.x;
      n.y += diff.y;
    });
    this.eventBus.publish("RebuildTreeRequested");
    this.eventBus.publish("RenderRequested");
  };
  foldChildren = (node: Node, unfold?: boolean) => {
    const childrenToFold = NodeUtils.findAllConnectedNodes(
      node,
      this.state.nodes
    ).filter((n) => n !== node);
    if (childrenToFold.length > 0) {
      childrenToFold.forEach((child) => {
        child.hidden = !unfold;
      });
      node.hideChildren = !unfold;
    }
    this.eventBus.publish("RebuildTreeRequested");
    this.eventBus.publish("RenderRequested");
  };
  selectSingleNode = (node: Node) => {
    this.state.selectedNodes = [node];
  };
  goToNodeType = () => {
    const { type, node } = this.state.hover;
    if (type && node) {
      const parentNode = this.state.nodes.find((n) => n.name === node.type);
      if (parentNode) {
        this.selectSingleNode(parentNode);
        this.eventBus.publish("CenterOnNode", { node: parentNode });
      }
    }
  };
  selectNode = ({ position }: { position: ScreenPosition }) => {
    const { node, io, type } = this.state.hover;
    if (node && !io && !type) {
      if (position.shiftKey) {
        const hasIndex = this.state.selectedNodes.indexOf(node);
        if (hasIndex !== -1) {
          this.state.selectedNodes.splice(hasIndex);
          return;
        }
        this.state.selectedNodes.push(node);
      } else {
        if (
          this.state.selectedNodes.length === 1 ||
          this.state.selectedNodes.indexOf(node) === -1
        ) {
          this.selectSingleNode(node);
        }
      }
    } else {
      this.state.selectedNodes = [];
    }
    this.eventBus.publish("NodeSelected", {
      e: position,
      selectedNodes: [...this.state.selectedNodes],
    });
    this.eventBus.publish("RenderRequested");
  };

  getCenter = () => {
    const X: number[] = [];
    const Y: number[] = [];
    this.state.nodes.forEach((n) => X.push(n.x) && Y.push(n.y));
    return {
      x: 0.5 * (Math.max(...X) + Math.min(...X)),
      y: 0.5 * (Math.max(...Y) + Math.min(...Y)),
    };
  };
}
