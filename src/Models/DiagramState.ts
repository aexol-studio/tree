import { Node } from "./Node";
import { Category } from "./Category";
import { Link } from "./Link";
import { ScreenPosition } from "../IO/ScreenPosition";
import { NodeDefinition } from "./NodeDefinition";
import { UIState } from "./UIState";
import { QuadTree } from "../QuadTree/index";
import { BoundingBox } from "./QuadTree";

export interface DiagramState {
  links: Link[];
  nodes: Node[];
  categories: Category[];
  nodeDefinitions: NodeDefinition[];
  selectedLinks: Link[];
  selectedNodes: Node[];
  trees: {
    node: QuadTree<BoundingBox & { node: Node }>;
    link: QuadTree<BoundingBox & { link: Link }>;
  };
  renamed?: {
    node?: Node;
    description?: boolean;
  };
  draw?: {
    node: Node;
    io: "i" | "o";
    initialPos: ScreenPosition;
  };
  hoverMinimap: boolean;
  hover: {
    node?: Node;
    link?: Link;
    menu?: {
      index: number;
    };
    io?: "i" | "o";
    description?: Node;
  };
  menu?: {
    position: ScreenPosition;
  };
  drawedConnection?: ScreenPosition;
  lastPosition: ScreenPosition;
  uiState: UIState;
}
