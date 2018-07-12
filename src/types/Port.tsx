import { NodeType } from './Node';

export type AcceptedConnection = {
  node: Pick<NodeType, 'type' | 'subType' | 'kind'>;
  count?: number;
};

export type PortType = {
  id?: string;
  name: string;
  unpluggable?: boolean;
  connected?: boolean;
  type?: string;
  output?: boolean;
  x?: number;
  y?: number;
  accepted?: AcceptedConnection[];
};
export type PortActions = {
  portUp: (x: number, y: number, output: boolean) => void;
  portDown: (x: number, y: number, output: boolean) => void;
  portPosition: (x: number, y: number, output: boolean) => void;
};
