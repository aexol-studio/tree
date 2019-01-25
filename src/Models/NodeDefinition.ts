import { Node } from "./Node";
import { NodeOption } from "./NodeOption";

export interface NodeDefinition {
  node: Pick<Node, "name" | "description" | "inputs" | "outputs">;
  type: string;
  acceptsInputs?: NodeDefinition[];
  instanceAcceptsInputs?: NodeDefinition[];
  options?: NodeOption[];
  instanceOptions?: NodeOption[];
  object?: boolean;
  main?: boolean;
  parent?: NodeDefinition;
  maxInputDepth?: number;
  id?: string;
  help?: string;
}
