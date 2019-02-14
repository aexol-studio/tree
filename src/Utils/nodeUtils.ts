import { Utils } from "./index";
import {
  Node,
  Graph,
  NodeDefinition,
  DiagramTheme,
  DataObjectInTree,
  AcceptedNodeDefinition
} from "../Models";
import { ScreenPosition } from "../IO/ScreenPosition";
import { DefaultDiagramTheme } from "../Theme/DefaultDiagramTheme";
import { RectanglePacker } from "../RectanglePacker/index";
export class NodeUtils {
  static createObjectDefinition(
    nodeDefinition: NodeDefinition,
    type: string
  ): NodeDefinition[] {
    if (!nodeDefinition.instances) return [];
    return nodeDefinition.instances.map(
      instance =>
        ({
          ...nodeDefinition,
          type,
          root: undefined,
          main: undefined,
          parent: nodeDefinition,
          id: Utils.generateId(),
          ...instance,
          node: {
            ...nodeDefinition.node,
            inputs: [],
            outputs: [],
            ...((instance && instance.node) || {})
          }
        } as NodeDefinition)
    );
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
    if (nodeDefinition.root) {
      const newDefinitions = NodeUtils.createObjectDefinition(
        nodeDefinition,
        node.name || `${nodeDefinition.type}${nodeDefinitions.length}`
      );
      createdNode.editsDefinitions = newDefinitions;
      for (const newDefinition of newDefinitions) {
        nodeDefinitions.push(newDefinition);
      }
    }
    return createdNode;
  };
  static AcceptedNodeDefinitionsToDefinitions = (
    ndc: AcceptedNodeDefinition[]
  ): NodeDefinition[] => {
    const nodeDefinitions: NodeDefinition[] = [];
    const recurisveExtractDefinitions = (ndc: AcceptedNodeDefinition[]) => {
      ndc.forEach(nd => {
        if (nd.definition) nodeDefinitions.push(nd.definition);
        if (nd.category) recurisveExtractDefinitions(nd.category.definitions);
      });
    };
    recurisveExtractDefinitions(ndc);
    return nodeDefinitions;
  };
  static getDefinitionAcceptedInputs = (
    definition: NodeDefinition,
    definitions: NodeDefinition[]
  ): NodeDefinition[] =>
    NodeUtils.AcceptedNodeDefinitionsToDefinitions(
      NodeUtils.getDefinitionAcceptedInputCategories(definition, definitions)
    );
  static getDefinitionAcceptedOutputs = (
    definition: NodeDefinition,
    definitions: NodeDefinition[]
  ): NodeDefinition[] =>
    NodeUtils.AcceptedNodeDefinitionsToDefinitions(
      NodeUtils.getDefinitionAcceptedOutputCategories(definition, definitions)
    );
  static getDefinitionAcceptedOutputCategories = (
    definition: NodeDefinition,
    definitions: NodeDefinition[]
  ) => {
    let defs: AcceptedNodeDefinition[] = [];
    if (definition.acceptsOutputs)
      defs = defs.concat(definition.acceptsOutputs(definition, definitions));
    return Utils.dedupe(defs);
  };
  static getDefinitionAcceptedInputCategories = (
    definition: NodeDefinition,
    definitions: NodeDefinition[]
  ) => {
    let defs: AcceptedNodeDefinition[] = [];
    if (definition.acceptsInputs)
      defs = defs.concat(definition.acceptsInputs(definition, definitions));
    return Utils.dedupe(defs);
  };
  static graphFromNode = (n: Node): Graph => {
    const graphNodes: Node[] = [];
    const spawnConnections = (n: Node) => {
      if (graphNodes.find(no => no === n)) return;
      graphNodes.push(n);
      n.inputs && n.inputs.map(spawnConnections);
      n.outputs && n.outputs.map(spawnConnections);
    };
    spawnConnections(n);
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
      const graph = NodeUtils.graphFromNode(node);
      usedNodes = usedNodes.concat(graph.nodes);
      graphs.push(graph);
    }
    return graphs;
  };
  static positionGraph = (
    graph: Graph,
    theme: DiagramTheme = DefaultDiagramTheme
  ): Graph => {
    if (graph.nodes.length === 0) return graph;

    let levels: Record<string, Node[]> = {};
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
      Math.max(...levelsKeys.map(l => levels[l].length)) *
      (node.height + node.spacing.y);
    levelsKeys
      .map(k => parseInt(k))
      .forEach(x => {
        let height = levels[x].length * (node.height + node.spacing.y);
        const centrise = (maxHeight - height) / maxHeight;
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
  static beautifyDiagram = (nodes: Node[], theme: DiagramTheme) => {
    const graphs = NodeUtils.graphsFromNodes(nodes);
    RectanglePacker.pack(graphs.map(g => NodeUtils.positionGraph(g)), theme);
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
