import { Node } from "../Models";
import { Graph } from "../Models/Graph";
import { ScreenPosition } from "../IO/ScreenPosition";

export { MinimapUtils } from './minimapUtils';
/**
 * Utils
 *
 * Various utils.
 */
export class Utils {
  static generateId = () =>
    new Array(crypto.getRandomValues(new Uint8Array(4))).join("-");
  static between = (a: number, b: number) => (c: number) => c >= a && c <= b;
  static dedupe = <T>(a: T[]) => a.filter((b, i) => a.indexOf(b) === i);
  static snap = <T extends ScreenPosition>(e: T, snappingGridSize: number):T => ({
    ...e,
    x: Math.floor(e.x / snappingGridSize)*snappingGridSize,
    y: Math.floor(e.y / snappingGridSize)*snappingGridSize
  });
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
      graphNodes = [...Utils.graphFromNode(i, graphNodes).nodes];
    }
    // dedupe on circular references
    graphNodes = Utils.dedupe(graphNodes);
    return {
      nodes: graphNodes
    };
  };
  static graphsFromNodes = (nodes: Node[]) => {
    const usedNodes: Node[] = [];
    const graphs: Graph[] = [];
    for (const node of nodes) {
      if (usedNodes.find(un => un === node)) {
        continue;
      }
      const graph = Utils.graphFromNode(node, usedNodes);
      usedNodes.concat(graph.nodes);
      graphs.push(graph);
    }
    return graphs;
  };
}
