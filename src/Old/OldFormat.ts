export interface OldNode {
  id?: string;
  x?: number;
  y?: number;
  name: string;
  type: string;
  subType?: string;
  kind?: string;
  required?: boolean;
  tab?: string;
  clone?: string;
}
export interface OldLink {
  from: {
    nodeId: string;
    portId: string;
  };
  to: {
    nodeId: string;
    portId: string;
  };
  noDraw?: boolean;
}
export interface OldFormat {
  nodes: OldNode[];
  links: OldLink[];
  tabs: string[];
}
