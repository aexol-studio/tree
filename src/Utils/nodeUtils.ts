import { Utils } from "./index";
import {
  Node,
  Graph,
  NodeDefinition,
  DiagramTheme,
  DataObjectInTree
} from "../Models";
import { ScreenPosition } from "../IO/ScreenPosition";
import { DefaultDiagramTheme } from "../Theme/DefaultDiagramTheme";
export class NodeUtils {
  static createObjectDefinition(
    nodeDefinition: NodeDefinition,
    type: string
  ): NodeDefinition {
    const newDefinition: NodeDefinition = {
      ...nodeDefinition,
      type,
      object: undefined,
      main: undefined,
      parent: nodeDefinition,
      id: Utils.generateId(),
      node: {
        ...nodeDefinition.node,
        inputs: [],
        outputs: []
      }
    };
    return newDefinition;
  }

  static createBasicNode(
    e: ScreenPosition,
    nodeDefinition: NodeDefinition,
    node: Partial<Node> = {}
  ): Node {
    const nodeD: NodeDefinition["node"] = Utils.deepCopy(nodeDefinition.node);
    return {
      name: "Node",
      id: Utils.generateId(),
      description: "Enter your description",
      x: e.x,
      y: e.y,
      inputs: [],
      outputs: [],
      options: [],
      definition: nodeDefinition,
      ...nodeD,
      ...node
    };
  }

  static createNode = (
    e: ScreenPosition,
    nodeDefinition: NodeDefinition,
    nodeDefinitions: NodeDefinition[]
  ): Node => {
    const { node: nodeSettings } = nodeDefinition;
    const node: NodeDefinition["node"] = Utils.deepCopy(nodeSettings);
    const createdNode: Node = NodeUtils.createBasicNode(e, nodeDefinition);
    if (nodeDefinition.object) {
      const newDefinition = NodeUtils.createObjectDefinition(
        nodeDefinition,
        node.name
      );
      createdNode.editsDefinition = newDefinition;
      nodeDefinitions.push(newDefinition);
    }
    return createdNode;
  };
  static getDefinitionAcceptedInputs = (definition: NodeDefinition) =>
    (definition.parent
      ? definition.instanceAcceptsInputs || definition.acceptsInputs
      : definition.acceptsInputs) || [];
  static graphFromNode = (n: Node, together: Node[] = []): Graph => {
    let graphNodes: Node[] = [n, ...together];
    const notInNodes = (nodes: Node[]) => (n: Node) =>
      !nodes.find(nd => nd.id === n.id);
    let connectedNodes: Node[] = [];
    if (n.inputs) {
      connectedNodes = [...connectedNodes, ...n.inputs];
    }
    if (n.outputs) {
      connectedNodes = [...connectedNodes, ...n.outputs];
    }
    connectedNodes = connectedNodes.filter(notInNodes(graphNodes));
    for (const i of connectedNodes) {
      graphNodes = [...NodeUtils.graphFromNode(i, graphNodes).nodes];
    }
    // dedupe on circular references
    graphNodes = Utils.dedupe(graphNodes);
    const graphX = graphNodes.map(n => n.x);
    const graphY = graphNodes.map(n => n.y);
    const graphBB = {
      min: {
        x: Math.min(...graphX),
        y: Math.min(...graphY)
      },
      max: {
        x: Math.max(...graphX),
        y: Math.max(...graphY)
      }
    };
    const width = Math.abs(graphBB.min.x - graphBB.max.x);
    const height = Math.abs(graphBB.min.y - graphBB.max.y);
    return {
      nodes: graphNodes,
      width,
      height,
      center: {
        x: graphBB.min.x + width / 2.0,
        y: graphBB.min.y + height / 2.0
      }
    };
  };
  static graphsFromNodes = (nodes: Node[]) => {
    let usedNodes: Node[] = [];
    const graphs: Graph[] = [];
    for (const node of nodes) {
      if (usedNodes.find(un => un === node)) {
        continue;
      }
      const graph = NodeUtils.graphFromNode(node, usedNodes);
      usedNodes = usedNodes.concat(graph.nodes);
      graphs.push(graph);
    }
    return graphs;
  };
  static positionGraph = (
    graph: Graph,
    theme: DiagramTheme = DefaultDiagramTheme
  ): Graph => {
    let levels: Record<number, Node[]> = {};
    const repositioned: Node[] = [];
    const repositionNode = (n: Node, level: number = 0) => {
      if (repositioned.find(r => r === n)) return;
      levels[level] = levels[level] || [];
      repositioned.push(n);
      levels[level].push(n);

      n.inputs && n.inputs.forEach(i => repositionNode(i, level - 1));
      n.outputs && n.outputs.forEach(i => repositionNode(i, level + 1));
    };
    if (graph.nodes.length === 0) return graph;
    repositionNode(graph.nodes[0]);
    const levelsKeys = Object.keys(levels);
    const { node, port } = theme;
    const width =
      levelsKeys.length * (node.width + node.spacing.x + port.width * 2) -
      node.spacing.x;
    const maxHeight =
      Math.max(...levelsKeys.map(l => l.length)) *
      (node.height + node.spacing.y);
    levelsKeys
      .map(k => parseInt(k))
      .forEach(x => {
        let height = levels[x].length * (node.height + node.spacing.y);
        const centrise = (maxHeight - height) / maxHeight;
        centrise;
        levels[x].forEach((node, index, a) => {
          node.x = (x * width) / levelsKeys.length;
          node.y = ((index - 1) * height) / a.length + centrise;
        });
      });
    graph.height = maxHeight;
    graph.width = width;
    graph.center.x = width / 2.0;
    graph.center.y = maxHeight / 2.0;
    return graph;
  };
  static beautifyDiagram = (nodes: Node[]) => {
    const graphs = NodeUtils.graphsFromNodes(nodes);
    graphs.forEach(g => NodeUtils.positionGraph(g));
  };
  static createTreeNode = (
    data: Node,
    theme: DiagramTheme = DefaultDiagramTheme
  ): DataObjectInTree<Node> => ({
    data,
    bb: {
      min: {
        x: data.x - theme.port.width,
        y: data.y
      },
      max: {
        x: data.x + theme.node.width + theme.port.width,
        y: data.y + theme.node.height
      }
    }
  });
}
