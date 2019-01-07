import { Node } from "./Node";

export interface Link {
  from: Node;
  to: Node;
  centerPoint?: number;
}
