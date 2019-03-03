import { Node } from "./Node";
import { Link } from "./Link";

export interface Snapshot {
  nodes: Node[];
  links: Link[];
}

export type SnapshotType = 'past' | 'future'