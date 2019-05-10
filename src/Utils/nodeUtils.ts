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
      name: nodeDefinition.type || "Node",
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
    if (nodeDefinition.instances) {
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
    incomingDefinition: NodeDefinition,
    definitions: NodeDefinition[],
    definition: NodeDefinition,
    nodes: Node[],
    node?: Node
  ): NodeDefinition[] =>
    NodeUtils.AcceptedNodeDefinitionsToDefinitions(
      NodeUtils.getDefinitionAcceptedInputCategories(
        incomingDefinition,
        definitions,
        definition,
        nodes,
        node
      )
    );
  static getDefinitionAcceptedOutputs = (
    incomingDefinition: NodeDefinition,
    definitions: NodeDefinition[],
    definition: NodeDefinition,
    nodes: Node[],
    node?: Node
  ): NodeDefinition[] =>
    NodeUtils.AcceptedNodeDefinitionsToDefinitions(
      NodeUtils.getDefinitionAcceptedOutputCategories(
        incomingDefinition,
        definitions,
        definition,
        nodes,
        node
      )
    );
  static getDefinitionAcceptedOutputCategories = (
    incomingDefinition: NodeDefinition,
    definitions: NodeDefinition[],
    definition?: NodeDefinition,
    nodes?: Node[],
    node?: Node
  ) => {
    let defs: AcceptedNodeDefinition[] = [];
    if (incomingDefinition.acceptsOutputs)
      defs = defs.concat(
        incomingDefinition.acceptsOutputs(
          incomingDefinition,
          definitions,
          definition,
          nodes,
          node
        )
      );
    return Utils.dedupe(defs);
  };
  static getDefinitionAcceptedInputCategories = (
    incomingDefinition: NodeDefinition,
    definitions: NodeDefinition[],
    definition?: NodeDefinition,
    nodes?: Node[],
    node?: Node
  ) => {
    let defs: AcceptedNodeDefinition[] = [];
    if (incomingDefinition.acceptsInputs)
      defs = defs.concat(
        incomingDefinition.acceptsInputs(
          incomingDefinition,
          definitions,
          definition,
          nodes,
          node
        )
      );
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
    const { center } = graph;
    const repositionNode = (n: Node, level: number = 0) => {
      if (repositioned.find(r => r === n)) return;
      levels[level] = levels[level] || [];
      repositioned.push(n);
      levels[level].push(n);
      n.inputs && n.inputs.forEach(i => repositionNode(i, level - 1));
    };
    repositionNode(
      graph.nodes.find(n => !n.outputs || n.outputs.length === 0)!
    );
    const levelsKeys = Object.keys(levels).map(k => parseInt(k));
    levelsKeys.sort((a, b) => a - b);
    const { node, port } = theme;
    const width =
      levelsKeys.length * (node.width + node.spacing.x + port.width * 2) -
      node.spacing.x;
    levelsKeys.forEach((x, i) => {
      let lastNode = 0;
      if (i === 0)
        levels[x].sort((a, b) => {
          const aOutput = a.outputs![0].id;
          const bOutput = b.outputs![0].id;
          if (aOutput === bOutput) return 0;
          return aOutput > bOutput ? 1 : -1;
        });
      else
        levels[x].sort((a, b) => {
          if (!b.inputs || b.inputs.length === 0) return -2;
          if (a.inputs === b.inputs) return 0;
          return (a.inputs ? a.inputs.length : 0) >
            (b.inputs ? b.inputs.length : 0)
            ? 1
            : -1;
        });
      levels[x].forEach((n, index, a) => {
        n.x = (i * width) / levelsKeys.length;
        if (n.inputs && n.inputs.length > 0) {
          const yS = n.inputs.map(i => i.y);
          const [minY, maxY] = [Math.min(...yS), Math.max(...yS)];
          n.y = (minY + maxY) / 2.0;
          lastNode = lastNode > n.y ? lastNode : n.y;
        } else {
        }
      });
      levels[x].forEach((n, index, a) => {
        n.x = (i * width) / levelsKeys.length;
        if (n.inputs && n.inputs.length > 0) {
        } else {
          n.y = lastNode + node.height + node.spacing.y;
          lastNode = n.y;
        }
      });
    });
    const newGraph = NodeUtils.graphFromNode(graph.nodes[0]);
    const diff = {
      x: center.x - newGraph.center.x,
      y: center.y - newGraph.center.y
    };
    newGraph.nodes.forEach(n => {
      n.x += diff.x;
      n.y += diff.y;
    });
    return NodeUtils.graphFromNode(graph.nodes[0]);
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
        y: data.y - theme.node.typeSize
      },
      max: {
        x: data.x + theme.node.width + theme.port.width,
        y: data.y + theme.node.height
      }
    }
  });
}
