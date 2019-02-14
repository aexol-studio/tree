import { DiagramState } from "../Models/index";
import { Format } from "./Format";
import {
  serializeNode,
  deserializeNode,
  NodeSerialized,
  deserializeNodeDefinition
} from "./Node";
import { serializeLink, deserializeLink, LinkSerialized } from "./Link";
import { NodeDefinition } from "../Models/NodeDefinition";
import { NodeUtils } from "../Utils/nodeUtils";

export class Serializer {
  static serialize(state: Pick<DiagramState, "nodes" | "links">): Format {
    return {
      nodes: state.nodes.map(serializeNode),
      links: state.links.map(serializeLink)
    };
  }
  static deserialize(
    state: Format,
    nodeDefinitions: NodeDefinition[]
  ): Pick<DiagramState, "nodes" | "links"> {
    const objectDefinitons = (n: NodeSerialized) => n.definition.root;
    state.nodes.filter(objectDefinitons).forEach(n => {
      const nodeDefinition = deserializeNodeDefinition(
        n.definition,
        nodeDefinitions
      );
      NodeUtils.createObjectDefinition(nodeDefinition, n.name).forEach(nd =>
        nodeDefinitions.push(nd)
      );
    });
    const nodes = state.nodes.map(n => deserializeNode(n, nodeDefinitions));
    const links = state.links.map(l => deserializeLink(l, nodes));
    return {
      nodes,
      links
    };
  }
}
export { Format, LinkSerialized, NodeSerialized };
