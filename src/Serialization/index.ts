import { DiagramState } from "../Models/index";
import { Format } from "./Format";
import { serializeNode, deserializeNode } from "./Node";
import { serializeLink, deserializeLink } from "./Link";
import { NodeDefinition } from "../Models/NodeDefinition";

export class Serializer {
  static serialize(state: Pick<DiagramState, "nodes" | "links">): Format {
    return {
      nodes: state.nodes.map(serializeNode),
      links: state.links.map(serializeLink)
    };
  }
  static deserialize(
    state: Format,
    definitions: NodeDefinition[]
  ): Pick<DiagramState, "nodes" | "links"> {
    const nodes = state.nodes.map(n => deserializeNode(n, definitions));
    const links = state.links.map(l => deserializeLink(l, nodes));
    return {
      nodes,
      links
    };
  }
}
