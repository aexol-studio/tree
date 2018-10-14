import { PortType } from './Port';
import * as styles from '../react-renderer/style/Node';
import { Item } from './SpaceMenu';
export type NodeType = {
  id?: string;
  x?: number;
  y?: number;
  selected?: boolean;
  editable?: boolean;
  name: string;
  type: string;
  subType?: string;
  kind?: string;
  required?:boolean;
  inputs: Array<PortType>;
  outputs: Array<PortType>;
  nodes?: Array<NodeType>;
  items?: Array<Item>;
  renamed?:boolean;
  tab?:string;
  clone?: string;
  styles?: typeof styles;
  invalid?: boolean;
  noDraw?:boolean
};
export type NodeTypePartial = { [P in keyof NodeType]?: NodeType[P] };
export type NodeActions = {
  nodeDown: (id: string, x: number, y: number) => void;
  nodeDoubleClick?: (id: string, x: number, y: number) => void;
  nodeUp: (id: string) => void;
  portUp: (x: number, y: number, portId: string, id: string, output: boolean) => void;
  portDown: (x: number, y: number, portId: string, id: string, output: boolean) => void;
  portPosition: (x: number, y: number, portId: string, id: string, output: boolean) => void;
  contextMenu: (id: string, x: number, y: number) => void;
};
