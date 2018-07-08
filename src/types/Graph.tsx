import { LinkType, NodeType } from '.';
import { Item } from './SpaceMenu';
export type ActionCategory = {
  name: string;
  items?: Array<Item>;
};
export type LoadedFile = {
  nodes: Array<NodeType>;
  links: Array<LinkType>;
};

export type GraphProps = {
  categories?: Array<ActionCategory>;
  serialize?: (nodes: Array<NodeType>, links: Array<LinkType>) => void;
  load?: () => Array<NodeType>;
  loaded?: LoadedFile;
};
export type GraphState = {
  renamed?: boolean;
  expand?: NodeType;
  path?: Array<string | null>;
  nodes: NodeType[];
  links: LinkType[];
  spacePressed: boolean;
  ctrlPressed: boolean;
  spaceX: number;
  spaceY: number;
  mouseX: number;
  mouseY: number;
  action: Action;
  activeNodes?: Array<NodeType>;
  activePort?: {
    x: number;
    y: number;
    endX: number;
    endY: number;
    id: string;
    portId: string;
    output: boolean;
  };
  pan: {
    x: number;
    y: number;
  };
  loaded?: LoadedFile;
};
export type GraphStatePartial = { [P in keyof GraphState]?: GraphState[P] };
export enum Action {
  Nothing,
  Pan,
  MoveNode,
  SelectedNode,
  ConnectPort,
  Left
}

export const GraphInitialState: GraphState = {
  renamed: null,
  expand: null,
  path: [null],
  nodes: [],
  links: [],
  spacePressed: false,
  ctrlPressed: false,
  spaceX: 0,
  spaceY: 0,
  mouseX: 0,
  mouseY: 0,
  action: Action.Nothing,
  activeNodes: [],
  activePort: null,
  loaded: null,
  pan: {
    x: 0,
    y: 0
  }
};

export type Snapshot = {
  nodes: NodeType[];
  links: LinkType[];
};
export type GraphUndo = () => void;
export type GraphSnapshot = (where: 'past' | 'future', clear?: 'past' | 'future') => void;
export type GraphDeleteNode = () => {
  nodes: NodeType[];
  links: LinkType[];
};
export type GraphCloneNode = () => void;
