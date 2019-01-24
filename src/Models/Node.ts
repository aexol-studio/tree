import { NodeDefinition } from "./NodeDefinition";

export interface Node {
  id: string;
  name: string;
  description?: string;
  x: number;
  y: number;
  inputs?: Node[] | null;
  outputs?: Node[] | null;
  definition: NodeDefinition;
  editsDefinition?: NodeDefinition;
  readonly?: boolean;
}
