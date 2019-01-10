export interface Node {
  id: string;
  name?: string;
  type?: string;
  description?: string;
  x: number;
  y: number;
  inputs?: Node[] | null;
  outputs?: Node[] | null;
}