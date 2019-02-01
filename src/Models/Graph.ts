import { Node } from "./Node";

export interface Graph {
  nodes: Node[];
  width: number;
  height: number;
  center: { x: number; y: number };
}
