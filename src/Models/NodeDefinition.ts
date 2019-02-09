import { Node } from "./Node";
import { NodeOption } from "./NodeOption";
import { Category } from "./Category";

export interface AcceptedNodeDefinition<Data = {}> {
  definition?: NodeDefinition<Data>;
  category?: {
    name: string;
    definitions: AcceptedNodeDefinition<Data>[];
  };
}
export interface NodeDefinition<Data = {}> {
  node: Pick<Node, "name" | "description" | "inputs" | "outputs">;
  categories?: {
    inputs?: Category[];
    outputs?: Category[];
    node?: Category[];
  };
  type: string;
  acceptsInputs?: (
    definition: NodeDefinition<Data>,
    allDefinitions: NodeDefinition<Data>[]
  ) => AcceptedNodeDefinition<Data>[];
  acceptsOutputs?: (
    definition: NodeDefinition<Data>,
    allDefinitions: NodeDefinition<Data>[]
  ) => AcceptedNodeDefinition<Data>[];
  instances?: Partial<NodeDefinition<Data>>[];
  options?: NodeOption[];
  object?: boolean;
  main?: boolean;
  hidden?: boolean;
  parent?: NodeDefinition<Data>;
  maxInputDepth?: number;
  id?: string;
  help?: string;
  data?: Data;
}
