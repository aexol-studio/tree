import { Node } from "./Node";

export interface NodeDefinition {
  node: Pick<Node, "name" | "description" | "type" | "inputs" | "outputs" | "definition">;
  acceptsInputs?: NodeDefinition[];
  object?: boolean;
  main?: boolean;
  parent?: NodeDefinition;
  maxInputDepth?: number;
}
