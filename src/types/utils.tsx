import { NodeType, NodeTypePartial } from '.';

export type DeepUpdateType = {
  nodes: Array<NodeType>;
  id: string;
  node?: NodeTypePartial;
  remove?: boolean;
};
export type DeepUpdateArrayType = {
  nodes: Array<NodeType>;
  updated: Array<{ id: string; node?: NodeTypePartial }>;
  remove?: boolean;
};
export type ClonedUpdateType = {
  ids: Array<string>;
  name: string;
  nodes: Array<NodeType>;
};
