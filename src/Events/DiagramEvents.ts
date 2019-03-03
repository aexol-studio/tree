/**
 * DiagramEvents:
 *
 * Set of diagram-specific events, e.g. node was moved or link was created
 * Used possibly to indicate that diagram state have changed
 */
export enum DiagramEvents {
  NodeMoved = "NodeMoved",
  NodeSelected = "NodeSelected",
  NodeHover = "NodeHover",
  NodeCreated = "NodeCreated",
  NodeDeleted = "NodeDeleted",
  NodeChanged = "NodeChanged",
  LinkCreated = "LinkCreated",
  LinkDeleted = "LinkDeleted",
  LinkMoved = "LinkMoved",
  DrawingLink = "DrawingLink",
  PickRequested = "PickRequested",
  RebuildTreeRequested = "RebuildTreeRequested",
  RenderRequested = "RenderRequested",
  SerialisationRequested = "SerialisationRequested",
  UndoRequested = "UndoRequested",
  RedoRequested = "RedoRequested"
  // ...
}
