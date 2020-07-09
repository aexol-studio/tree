import { Node } from "./Node";
import { Link } from "./Link";
import { ScreenPosition } from "@io";
import { NodeDefinition } from "./NodeDefinition";
import { UIState } from "./UIState";
import { QuadTree } from "@quadTree";

export interface DiagramState {
  links: Link[];
  nodes: Node[];
  nodeDefinitions: NodeDefinition[];
  selectedLinks: Link[];
  selectedNodes: Node[];
  trees: {
    node: QuadTree<Node>;
    link: QuadTree<Link>;
  };
  renamed?: Node;
  draw?: {
    node: Node;
    io: "i" | "o";
    initialPos: ScreenPosition;
  };
  hoverMinimap: boolean;
  hover: {
    node?: Node;
    link?: Link;
    menu?: boolean;
    io?: "i" | "o";
    type?: boolean;
    description?: Node;
  };
  isReadOnly?: boolean;
  drawedConnection?: ScreenPosition;
  uiState: UIState;
  screenShotInProgress: boolean;
}
