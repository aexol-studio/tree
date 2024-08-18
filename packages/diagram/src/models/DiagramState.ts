import { Node } from "./Node";
import { Link } from "./Link";
import { ScreenPosition } from "@/io";
import { UIState } from "./UIState";
import { QuadTree } from "@/quadTree";

export interface DiagramState {
  links: Link[];
  nodes: Node[];
  selectedNodes: Node[];
  trees: {
    node: QuadTree<Node>;
    link: QuadTree<Link>;
  };
  hoverMinimap: boolean;
  hover: {
    node?: Node;
    type?: boolean;
  };
  drawedConnection?: ScreenPosition;
  uiState: UIState;
  screenShotInProgress: boolean;
}
