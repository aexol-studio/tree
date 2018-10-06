import { NodeType } from './Node';
export type PropsType = {
  node: NodeType;
  canBlurFocus?: boolean; 
  onChange: (node: NodeType) => void;
};
