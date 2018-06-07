import { NodeType } from './Node';
export type PropsType = {
  node: NodeType;
  canExpand?: boolean;
  canShrink?: boolean;
  onChange: (node: NodeType) => void;
  onExpand: () => void;
  onShrink: () => void;
};
