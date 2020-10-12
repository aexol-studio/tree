import { ScreenPosition } from "@io";
import { Node, Link, NodeDefinition } from "@models";
/**
 * DiagramEvents:
 *
 * Set of diagram-specific events, e.g. node was moved or link was created
 * Used possibly to indicate that diagram state have changed
 */
export interface DiagramEvents {
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
  FoldNodes: {
    node: Node;
  };
  NodeCreationRequested: {
    center?: boolean;
    nodeDefinition: NodeDefinition;
    position?: ScreenPosition;
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
  PanRequested: {
    position: ScreenPosition;
  };
  CenterPanRequested: {
    position: ScreenPosition;
  };
  CenterOnNode: {
    node: Node;
  };
  ScreenShotRendered: {
    context: CanvasRenderingContext2D;
  };
  ScreenMouseLeave: { position: ScreenPosition };
  ScreenMouseMove: { position: ScreenPosition };
  ScreenMouseDrag: { position: ScreenPosition };
  ScreenMouseOverMove: { position: ScreenPosition };
  ScreenLeftMouseUp: { position: ScreenPosition };
  ScreenRightMouseUp: { position: ScreenPosition };
  ScreenLeftMouseClick: { position: ScreenPosition };
  ScreenDoubleClick: { position: ScreenPosition };
  ScreenMouseWheel: { position: ScreenPosition; delta: number };

  WorldMouseMove: { position: ScreenPosition };
  WorldMouseOverMove: { position: ScreenPosition };
  WorldMouseDrag: {
    withoutPan: ScreenPosition;
    calculated: ScreenPosition;
  };
  WorldMouseDragEnd: { position: ScreenPosition };
  WorldLeftMouseClick: { position: ScreenPosition };
  WorldLeftMouseUp: { position: ScreenPosition };

  MinimapMouseMove: { position: ScreenPosition };
  MinimapLeftMouseClick: { position: ScreenPosition };

  ScreenRightMouseClick: { position: ScreenPosition };
  MPressed: { position: ScreenPosition };
  DeletePressed: { position: ScreenPosition };
  BackspacePressed: { position: ScreenPosition };
  RenamerChanged: { position: ScreenPosition };
}
