import { Node } from "./Node";
import { Category } from "./Category";
import { Link } from "./Link";
import { ScreenPosition } from "../IO/ScreenPosition";

export interface DiagramState {
  links: Link[];
  nodes: Node[];
  categories: Category[];
  selectedLinks: Link[];
  selectedNodes: Node[];
  draw?: {
    node: Node;
    io: "i" | "o";
  };
  hover: {
    node?: Node;
    link?: Link;
    io?: "i" | "o";
  };
  drawedConnection?: ScreenPosition;
  lastPosition: ScreenPosition;
}
