export interface InputNode {
  id: string;
  name: string;
  description?: string;
  options: string[];
  inputs?: string[] | null;
  outputs?: string[] | null;
  type: string;
}

export interface Node extends InputNode {
  x: number;
  y: number;
  hidden?: boolean;
  hideChildren?: boolean;
}
