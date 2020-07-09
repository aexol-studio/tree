import { ScreenPosition } from "@io";
import { Category, Node, Link, NodeDefinition } from "@models";
/**
 * DiagramEvents:
 *
 * Set of diagram-specific events, e.g. node was moved or link was created
 * Used possibly to indicate that diagram state have changed
 */
export type DiagramEvents = keyof DiagramEventsPayloads;
export interface DiagramEventsPayloads {
  NodeMoved: {
    selectedNodes: Node[];
  };
  NodeSelected: {
    e: ScreenPosition;
    selectedNodes: Node[];
  };
  NodeCreated: {
    node: Node;
  };
  NodeDeleted: {
    nodes: Node[];
  };
  NodeChanged: {
    node: Node;
  };
  // not handled yet
  NodeRenameFocus: {
    node: Node;
  };
  // not handled yet
  NodeRenameShowInput: {
    node: Node;
  };
  // not handled yet
  NodeRenameEnded: {
    node: Node;
  };
  // not handled yet
  FoldNodes: {
    node: Node;
  };
  NodeCreationRequested: {
    nodeDefinition: NodeDefinition;
    position: ScreenPosition;
  };
  // not handled yet
  DescriptionRenameShowInput: {
    node: Node;
  };
  // not handled yet
  DescriptionRenameEnded: {
    node: Node;
  };
  // not handled yet
  DescriptionRenameFocus: {
    node: Node;
  };
  // not handled yet
  DescriptionMakeReadOnly: {
    node: Node;
  };
  // not handled yet
  DescriptionMakeEditable: {
    node: Node;
  };
  LinkCreated: {
    link: Link;
  };
  LinksDeleted: {
    links: Link[];
  };
  LinkMoved: {
    link: Link;
  };
  // not handled yet
  DrawingLink: {
    node: Node;
  };
  PickRequested: {
    position: ScreenPosition;
  };
  RebuildTreeRequested: {
    node: Node;
  };
  RenderRequested: {
    node: Node;
  };
  SerialisationRequested: {
    node: Node;
  };
  UndoRequested: {
    node: Node;
  };
  RedoRequested: {
    node: Node;
  };
  //CORRECT
  DataModelChanged: {
    nodes: Node[];
    links: Link[];
  };
  //CORRECT
  ViewModelChanged: {
    scale: number;
    pan: {
      x: number;
      y: number;
    };
  };
  PanRequested: {
    position: ScreenPosition;
  };
  CenterPanRequested: {
    position: ScreenPosition;
  };
  MenuRequested: {
    e: ScreenPosition;
    title: string;
    categories: Category[];
  };
  MenuCreateNodeRequested: {
    position: ScreenPosition;
  };
  MenuItemClicked: {
    category: Category;
  };
  CenterOnNode: {
    node: Node;
  };
  ScreenShotRendered: {
    context: CanvasRenderingContext2D;
  };
}
