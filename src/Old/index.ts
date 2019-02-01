import { OldFormat, OldNode } from "./OldFormat";
import { LinkSerialized } from "../Serialization/Link";
import {
  NodeSerialized,
  NodeDefinitionSerialized
} from "../Serialization/Node";

export class Old {
  static isObject(n: OldNode) {
    return !n.clone && !n.kind && !!n.subType ? true : undefined;
  }
  static definitionFromOldNode(
    n: OldNode,
    allOldNodes: OldNode[]
  ): NodeDefinitionSerialized {
    return {
      type: n.kind || n.type,
      object: Old.isObject(n),
      parent:
        n.clone && n.kind
          ? {
              type: allOldNodes.find(ao => ao.id === n.clone)!.type
            }
          : undefined
    };
  }
  static deserialize(f: OldFormat) {
    const links = f.links.map(
      l =>
        ({
          centerPoint: 0.5,
          iId: l.to.nodeId,
          oId: l.from.nodeId
        } as LinkSerialized)
    );
    const nodes = f.nodes.map(
      n =>
        ({
          id: n.id,
          x: n.x,
          y: n.y,
          name,
          description: "",
          options: n.required ? ["required"] : [],
          definition: Old.definitionFromOldNode(n, f.nodes),
          editsDefinition: Old.isObject(n) && {
            type: n.kind
          }
        } as NodeSerialized)
    );
    return {
      nodes,
      links
    };
  }
}
