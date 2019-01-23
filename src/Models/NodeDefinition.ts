import { Node } from "./Node";

export interface NodeDefinition {
  node: Pick<Node, "name" | "description" | "type" | "inputs" | "outputs">;
  acceptsInputs?: NodeDefinition[];
  instanceAcceptsInputs?: NodeDefinition[];
  object?: boolean;
  main?: boolean;
  parent?: NodeDefinition;
  maxInputDepth?: number;
  id?: string;
  help?: string;
}
