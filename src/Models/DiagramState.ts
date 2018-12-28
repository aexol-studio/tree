import { Node } from './Node';
import { Category } from './Category';
import { Link } from './Link';

export interface DiagramState {
  links: Link[];
  nodes: Node[];
  categories: Category[];
  selectedLinks: Link[];
  selectedNodes: Node[];
}
