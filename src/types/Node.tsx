import { PortType } from './Port';
export type NodeType = {
  id?: string;
  x?: number;
  y?: number;
  selected?: boolean;
  editable?: boolean;
  name: string;
  type?: string;
  subType?: string;
  inputs: Array<PortType>;
  outputs: Array<PortType>;
  nodes?: Array<NodeType>;
  clone?: string;
};
export type NodeTypePartial = { [P in keyof NodeType]?: NodeType[P] };
export type NodeActions = {
  nodeDown: (id: string, x: number, y: number) => void;
  nodeUp: (id: string) => void;
  portUp: (x: number, y: number, portId: string, id: string, output: boolean) => void;
  portDown: (x: number, y: number, portId: string, id: string, output: boolean) => void;
  portPosition: (x: number, y: number, portId: string, id: string, output: boolean) => void;
};
export type NodeState = {
  input: string;
};
