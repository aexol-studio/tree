import { ActionCategory } from './Graph';
import { NodeType } from './Node';

export type ContextMenuProps = {
  x: number;
  y: number;
  category: ActionCategory;
  addNode: (n: NodeType) => () => void;
};
export type ContextMenuState = {
  category?: string;
  menuWidth: number;
};
