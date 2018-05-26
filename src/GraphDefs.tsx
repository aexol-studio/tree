import { LinkType } from './Link';
import { NodeType } from './Node';
import { SpaceBarCategory, SpaceBarAction, Item } from './SpaceBarMenu';
export type NodeCategory = {
  name: string;
  type: SpaceBarAction.AddNode;
  items: Array<NodeType>;
  editable?: boolean;
};
export type ActionCategory = {
  name: string;
  type: SpaceBarAction.Action;
  items: Array<Item>;
};
export type LoadedFile = {
  nodes: Array<NodeType>;
  links: Array<LinkType>;
};

export type GraphProps = {
  categories?: Array<NodeCategory | ActionCategory>;
  actions?: Array<SpaceBarCategory>;
  serialize?: (nodes: Array<NodeType>, links: Array<LinkType>) => void;
  load?: () => Array<NodeType>;
  selectedNode?: string;
  loaded?: LoadedFile;
  onNodeSelect: (node: string) => void;
};
export type GraphState = {
  selected?: string;
  expand?: string;
  path?: Array<string | null>;
  nodes: Array<NodeType>;
  links: Array<LinkType>;
  spacePressed: boolean;
  spaceX: number;
  spaceY: number;
  mouseX: number;
  mouseY: number;
  action: Action;
  activeNode?: {
    id: string;
    x: number;
    y: number;
  };
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
};
export type GraphStatePartial = { [P in keyof GraphState]?: GraphState[P] };
export enum Action {
  Nothing,
  Pan,
  MoveNode,
  ConnectPort
}

export const GraphInitialState: GraphState = {
  selected: null,
  expand: null,
  path: [null],
  nodes: [],
  links: [],
  spacePressed: false,
  spaceX: 0,
  spaceY: 0,
  mouseX: 0,
  mouseY: 0,
  action: Action.Nothing,
  activeNode: null,
  activePort: null,
  loaded: null
};
