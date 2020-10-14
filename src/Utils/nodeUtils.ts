import { Utils } from "./index";
import {
  Node,
  Graph,
  DiagramTheme,
  DataObjectInTree,
  InputNode,
} from "@models";
import { ScreenPosition } from "@io";
import { DefaultDiagramTheme } from "@theme/DefaultDiagramTheme";
import { RectanglePacker } from "@rectanglePacker";
export class NodeUtils {
  static createBasicNode(e: ScreenPosition, node: Partial<Node> = {}): Node {
    return {
      name: "Node",
      type: "type",
      id: Utils.generateId(),
      description: "Enter your description",
      x: e.x,
      y: e.y,
      inputs: [],
      outputs: [],
      options: [],
      ...node,
    };
  }

  static findAllConnectedNodes = <T extends InputNode>(
    n: T,
    nodes: T[]
  ): T[] => {
    const graphNodes: T[] = [];
    const spawnConnections = (n: T) => {
      if (graphNodes.find((no) => no === n)) return;
      graphNodes.push(n);
      n.inputs &&
        n.inputs.map((i) =>
          spawnConnections(nodes.find((node) => node.id === i)!)
        );
      n.outputs &&
        n.outputs.map((o) =>
          spawnConnections(nodes.find((node) => node.id === o)!)
        );
    };
    spawnConnections(n);
    return graphNodes;
  };
  static graphFromNode = (
    n: InputNode,
    nodes: InputNode[],
    theme: DiagramTheme
  ): Graph => {
    const graphNodes: InputNode[] = NodeUtils.findAllConnectedNodes(n, nodes);

    if (graphNodes.length === 0) {
      throw new Error("Invalid graph");
    }
    const findX = (n: InputNode) => {
      const findOutputDepth = (node: InputNode, depth = 0): number => {
        if (node.outputs?.length) {
          const depths = node.outputs.map((no) =>
            findOutputDepth(graphNodes.find((gn) => gn.id === no)!, depth + 1)
          );
          return Math.max(...depths);
        }
        return depth;
      };
      return findOutputDepth(n);
    };
    const levelised: InputNode[][] = [];
    graphNodes.forEach((n) => {
      const depth = findX(n);
      if (!levelised[depth]) {
        levelised[depth] = [];
      }
      levelised[depth].push(n);
    });

    const maxY = Math.max(...levelised.map((v) => v.length));
    const positionedNodes = levelised
      .map((nodes, xOrder) => {
        const heightOfColumn = nodes.length;
        const startY = (maxY - heightOfColumn) / 2.0;
        return nodes.map((n, order) => {
          const x = -xOrder * (theme.node.width + theme.node.spacing.x);
          const y =
            (startY + order) * (theme.node.height + theme.node.spacing.y);
          return {
            ...n,
            x,
            y,
          };
        });
      })
      .reduce((a, b) => [...a, ...b]);

    const graphBB = {
      min: {
        x: -levelised.length * (theme.node.width + theme.node.spacing.x),
        y: 0,
      },
      max: {
        x: 0,
        y: maxY * (theme.node.height + theme.node.spacing.y),
      },
    };
    const width = Math.abs(graphBB.min.x - graphBB.max.x);
    const height = Math.abs(graphBB.min.y - graphBB.max.y);
    return {
      nodes: positionedNodes,
      width,
      height,
      center: {
        x: graphBB.min.x + width / 2.0,
        y: graphBB.min.y + height / 2.0,
      },
    };
  };
  static graphsFromNodes = (
    nodes: InputNode[],
    allNodes: InputNode[],
    theme: DiagramTheme
  ) => {
    let usedNodes: InputNode[] = [];
    const graphs: Graph[] = [];
    for (const node of nodes) {
      if (usedNodes.find((un) => un.id === node.id)) {
        continue;
      }
      const graph = NodeUtils.graphFromNode(node, allNodes, theme);
      usedNodes = usedNodes.concat(graph.nodes);
      graphs.push(graph);
    }
    return graphs;
  };
  static beautifyDiagram = (nodes: InputNode[], theme: DiagramTheme) => {
    const graphs = NodeUtils.graphsFromNodes(nodes, nodes, theme);
    RectanglePacker.pack(graphs, theme);
    return graphs;
  };
  static createTreeNode = (
    data: Node,
    theme: DiagramTheme = DefaultDiagramTheme
  ): DataObjectInTree<Node> => ({
    data,
    bb: {
      min: {
        x: data.x,
        y: data.y - theme.node.typeSize,
      },
      max: {
        x: data.x + theme.node.width,
        y: data.y + theme.node.height,
      },
    },
  });
}
