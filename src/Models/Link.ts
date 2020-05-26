import { Node } from "./Node";

export interface Link {
  i: Node;
  o: Node;
  centerPoint: number;
  circularReference?: boolean;
}
