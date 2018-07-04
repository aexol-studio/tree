import { NodeType, NodeTypePartial } from '.';

export type DeepUpdateArrayType = {
  nodes: Array<NodeType>;
  updated: Array<{ id: string; node?: NodeTypePartial }>;
  remove?: boolean;
};