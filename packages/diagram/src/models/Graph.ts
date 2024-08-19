import { InputNode, Node } from './Node';

export interface InputGraph {
  nodes: InputNode[];
  width: number;
  height: number;
  center: { x: number; y: number };
}

export interface Graph {
  nodes: Node[];
  width: number;
  height: number;
  center: { x: number; y: number };
}
