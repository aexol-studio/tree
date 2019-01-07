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
  hoveredNode?: Node;
  hoveredLink?: Link;
  hoveredInput?: Node;
  hoveredOutput?: Node;
  drawedConnection?: ScreenPosition;
  lastPosition: ScreenPosition;
}
