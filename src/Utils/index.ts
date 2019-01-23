import { Node, Link, DiagramTheme } from "../Models";
import { Graph } from "../Models/Graph";
import { ScreenPosition } from "../IO/ScreenPosition";
import { NodeDefinition } from "../Models/NodeDefinition";

export { MinimapUtils } from "./minimapUtils";
/**
 * Utils
 *
 * Various utils.
 */
export class Utils {
  static generateId = () =>
    new Array(crypto.getRandomValues(new Uint8Array(4))).join("-");
  static between = (a: number, b: number) => (c: number) => c >= a && c <= b;
  static clamp = (v: number, min: number, max: number) =>
    Math.max(Math.min(v, max), min);
  static dedupe = <T>(a: T[]) => a.filter((b, i) => a.indexOf(b) === i);
  static deepCopy = <T extends Record<string, any>>(o: T): T =>
    JSON.parse(JSON.stringify(o));
  static snap = <T extends ScreenPosition>(
    e: T,
    snappingGridSize: number
  ): T => ({
    ...e,
    x: Math.floor(e.x / snappingGridSize) * snappingGridSize,
    y: Math.floor(e.y / snappingGridSize) * snappingGridSize
  });
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
  static calculateLinkCenterPoint = <T extends { x: number }>(
    link: Link,
    theme: DiagramTheme,
    e: T
  ) => {
    const startX = link.o.x + theme.node.width;
    return (e.x - startX) / (link.i.x - startX);
  };
  static calculateLinkXCenter = (link: Link, theme: DiagramTheme) => {
    return Utils.calculateLinkXCenterMath(
      link.o.x + theme.node.width,
      link.i.x,
      link.centerPoint
    );
  };
  static calculateLinkXCenterMath = (
    x1: number,
    x2: number,
    centerPoint: number
  ) => {
    const distance = (x1 - x2) * centerPoint;
    return x1 - distance;
  };
  static componentToHex = (c: number) => {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };

  static rgbToHex = (r: number, g: number, b: number) => {
    return (
      "#" +
      Utils.componentToHex(r) +
      Utils.componentToHex(g) +
      Utils.componentToHex(b)
    );
  };
}
