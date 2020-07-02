import { NodeSerialized } from "./Node";
import { LinkSerialized } from "./Link";
import { DiagramTheme } from "@models";

export interface Format {
  nodes: NodeSerialized[];
  links: LinkSerialized[];
  theme?: DiagramTheme;
}
