import { Node } from "./Node";

export interface NodeDefinition {
  node: Pick<Node, "name" | "description" | "type">;
  acceptsInputs: Pick<Node, "type">[];
  object?: boolean;
  main?:boolean;
}
