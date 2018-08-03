import { NodeType } from './Node';

export type MiniMapType = {
  nodes: NodeType[];
  pan: {
    x: number;
    y: number;
  };
  width?:number;
  height?:number;
  graphWidth?:number;
  graphHeight?:number;
  scale:number;
  padding?:number;
};
