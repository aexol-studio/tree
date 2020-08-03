import { Node } from "./Node";
import { Link } from "./Link";
import { ScreenPosition } from "@io";
import { NodeDefinition } from "./NodeDefinition";
import { UIState } from "./UIState";

export interface DiagramState {
  links: Link[];
  nodes: Node[];
  nodeDefinitions: NodeDefinition[];
  selectedLinks: Link[];
  selectedNodes: Node[];
  renamed?: Node;
  draw?: {
    node: Node;
    io: "i" | "o";
    initialPos: ScreenPosition;
  };
  hoverMinimap: boolean;
  isReadOnly?: boolean;
  drawedConnection?: ScreenPosition;
  uiState: UIState;
  screenShotInProgress: boolean;
}
