import { NodeDefinition } from "./NodeDefinition";

export interface Node {
  id: string;
  name: string;
  description?: string;
  x: number;
  y: number;
  definition: NodeDefinition;
  options: string[];
  inputs?: Node[] | null;
  outputs?: Node[] | null;
  editsDefinitions?: NodeDefinition[];
  readonly?: boolean;
}
