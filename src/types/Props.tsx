import { NodeType } from './Node';
export type PropsType = {
  node: NodeType;
  canBlurFocus?: boolean; 
  canExpand?: boolean;
  canShrink?: boolean;
  onChange: (node: NodeType) => void;
  onExpand: () => void;
  onShrink: () => void;
};
