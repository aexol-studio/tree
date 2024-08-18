import { DiagramState } from "@/models";
import { Link, DiagramTheme, DataObjectInTree } from "@/models";
import { LinkUtils } from "@/utils";
import { QuadTree } from "@/quadTree";

/**
 * ConnectionManager:
 *
 * Connection Manager is for connections:
 */
export class ConnectionManager {
  constructor(private state: DiagramState, private theme: DiagramTheme) {}
  loadLinks = (links: Link[]) => {
    this.state.links = links;
    this.rebuildTree();
  };
  rebuildTree = () => {
    this.state.trees.link = new QuadTree<Link>();
    this.state.links
      .filter((l) => !(l.i.hidden || l.o.hidden))
      .forEach((l) =>
        this.state.trees.link.insert(LinkUtils.linkToTree(l, this.theme))
      );
  };
  linkToTree = (l: Link): DataObjectInTree<Link> =>
    LinkUtils.linkToTree(l, this.theme);
}
