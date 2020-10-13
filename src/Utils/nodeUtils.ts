import { Utils } from "./index";
import {
  Node,
  Graph,
  DiagramTheme,
  DataObjectInTree,
  InputNode,
  InputGraph,
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
  static graphFromNode = (n: InputNode, nodes: InputNode[]): InputGraph => {
    const graphNodes: InputNode[] = NodeUtils.findAllConnectedNodes(n, nodes);
    const maxDepth = 10;
    const maxHeight = 10;
    const graphBB = {
      min: {
        x: 0,
        y: 0,
      },
      max: {
        x: maxDepth,
        y: maxHeight,
      },
    };
    const width = Math.abs(graphBB.min.x - graphBB.max.x);
    const height = Math.abs(graphBB.min.y - graphBB.max.y);
    return {
      nodes: graphNodes,
      width,
      height,
      center: {
        x: graphBB.min.x + width / 2.0,
        y: graphBB.min.y + height / 2.0,
      },
    };
  };
  static graphsFromNodes = (nodes: InputNode[], allNodes: InputNode[]) => {
    let usedNodes: InputNode[] = [];
    const graphs: InputGraph[] = [];
    for (const node of nodes) {
      if (usedNodes.find((un) => un.id === node.id)) {
        continue;
      }
      const graph = NodeUtils.graphFromNode(node, allNodes);
      usedNodes = usedNodes.concat(graph.nodes);
      graphs.push(graph);
    }
    return graphs;
  };
  static positionGraph = (
    graph: InputGraph,
    theme: DiagramTheme = DefaultDiagramTheme
  ): Graph => {
    if (graph.nodes.length === 0) {
      throw new Error("Invalid graph");
    }
    const findX = (n: InputNode) => {
      const findOutputDepth = (node: InputNode, depth = 0): number => {
        if (node.outputs?.length) {
          const depths = node.outputs.map((no) =>
            findOutputDepth(graph.nodes.find((gn) => gn.id === no)!, depth + 1)
          );
          return Math.max(...depths);
        }
        return depth;
      };
      return findOutputDepth(n);
    };
    const levelised: InputNode[][] = [];
    graph.nodes.forEach((n) => {
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

    return {
      ...graph,
      nodes: positionedNodes,
    };
  };
  static beautifyDiagram = (nodes: InputNode[], theme: DiagramTheme) => {
    const graphs = NodeUtils.graphsFromNodes(nodes, nodes);
    const positionedGraphs = graphs.map((g) => NodeUtils.positionGraph(g));
    RectanglePacker.pack(positionedGraphs, theme);
    return positionedGraphs;
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
