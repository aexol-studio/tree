import { ActionCategory } from './Graph';
import { NodeType } from './Node';

export type Item = {
  name: string;
  action?: Function;
  items?: Array<Item>;
  node?: NodeType;
};

export type SpaceBarProps = {
  x: number;
  y: number;
  categories: Array<ActionCategory>;
  addNode: (n: NodeType) => () => void;
};
export type SpaceBarState = {
  category?: string;
  menuWidth: number;
};
