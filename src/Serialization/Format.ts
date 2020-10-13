import { LinkSerialized } from "./Link";
import { DiagramTheme, Node } from "@models";

export interface Format {
  nodes: Node[];
  links: LinkSerialized[];
  theme?: DiagramTheme;
}
