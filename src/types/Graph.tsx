import { LinkType, NodeType } from '.';
import { Item } from './SpaceMenu';
import { MAIN_TAB_NAME } from './Tabs';
export type ActionCategory = {
  name: string;
  items?: Array<Item>;
};
export type LoadedFile = {
  tabs?: Array<string>;
  nodes: Array<NodeType>;
  links: Array<LinkType>;
};

export type GraphProps = {
  categories?: Array<ActionCategory>;
  serialize?: (nodes: Array<NodeType>, links: Array<LinkType>, tabs: Array<string>) => void;
  dataSerialize?: (nodes: Array<NodeType>, links: Array<LinkType>, tabs: Array<string>) => void;
  load?: () => Array<NodeType>;
  validate?: (n1: NodeType, n2: NodeType) => boolean;
  loaded?: LoadedFile;
  preventOverscrolling?: boolean;
};
export type GraphState = {
  renamed?: boolean;
  path?: Array<string | null>;
  nodes: NodeType[];
  links: LinkType[];
  spacePressed: boolean;
  contextMenuActive: boolean;
  searchMenuActive: boolean;
  ctrlPressed: boolean;
  altPressed: boolean;
  spaceX: number;
  spaceY: number;
  contextX: number;
  contextY: number;
  mouseX: number;
  mouseY: number;
  action: Action;
  tabs?: string[];
  activeTab?: string;
  activeNodes?: Array<NodeType>;
  miniMapPanning: boolean;
  activePort?: {
    x: number;
    y: number;
    endX: number;
    endY: number;
    id: string;
    portId: string;
    output: boolean;
  };
  loaded?: LoadedFile;
  currentHover: Item | null;
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
  path: [null],
  nodes: [],
  links: [],
  spacePressed: false,
  contextMenuActive: false,
  ctrlPressed: false,
  altPressed: false,
  searchMenuActive: false,
  spaceX: 0,
  spaceY: 0,
  contextX: 0,
  contextY: 0,
  mouseX: 0,
  mouseY: 0,
  action: Action.Nothing,
  activeNodes: [],
  activePort: null,
  loaded: null,
  tabs: [MAIN_TAB_NAME],
  activeTab: MAIN_TAB_NAME,
  miniMapPanning: false,
  currentHover: null
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

export type GraphScale = (delta: number, x: number, y: number) => void;
export type GraphAutoPosition = () => void;
export type GraphValidate = () => void;
export type GraphPan = (x: number, y: number) => void;
export type GraphDrawConnectors = (mouseX: number, mouseY: number) => void;
export type GraphMoveNodes = (mouseX: number, mouseY: number) => void;
export type GraphUpdatePortPositions = (
  x: number,
  y: number,
  portId: string,
  id: string,
  output: boolean
) => void;
export type GraphSelectNodes = (
  node: NodeType
) => {
  action: Action;
  activeNodes?: NodeType[];
  renamed: boolean;
};
export type GraphGraphSelect = () => void;
export type GraphTreeSelect = () => void;
