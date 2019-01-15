import { Node } from "./Node";

export interface NodeDefinition {
  node: Pick<Node, "name" | "description" | "type" | "inputs" | "outputs">;
  acceptsInputs?: NodeDefinition[];
  object?: boolean;
  main?: boolean;
  hidden?: boolean;
  parent?: NodeDefinition;
  readonly?: boolean;
  maxInputDepth?: number;
}
