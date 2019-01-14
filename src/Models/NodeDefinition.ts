import { Node } from "./Node";

export interface NodeDefinition {
  node: Pick<Node, "name" | "description" | "type" | "inputs" | "outputs">;
  acceptsInputs?: Partial<Node>[];
  object?: boolean;
  main?: boolean;
  parent?: NodeDefinition;
}
