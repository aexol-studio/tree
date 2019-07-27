/**
 * DiagramEvents:
 *
 * Set of diagram-specific events, e.g. node was moved or link was created
 * Used possibly to indicate that diagram state have changed
 */
export enum DiagramEvents {
  NodeMoved = "NodeMoved",
  NodeSelected = "NodeSelected",
  NodeCreated = "NodeCreated",
  NodeDeleted = "NodeDeleted",
  NodeChanged = "NodeChanged",
  NodeRenameFocus = "NodeRenameFocus",
  NodeRenameShowInput = "NodeRenameShowInput",
  NodeRenameEnded = "NodeRenameEnded",
  NodeCreationRequested = "NodeCreationRequested",
  DescriptionRenameShowInput = "DescriptionRenameShowInput",
  DescriptionRenameEnded = "DescriptionRenameEnded",
  DescriptionRenameFocus = "DescriptionRenameFocus",
  DescriptionMakeReadOnly = "DescriptionMakeReadOnly",
  DescriptionMakeEditable = "DescriptionMakeEditable",
  LinkCreated = "LinkCreated",
  LinkDeleted = "LinkDeleted",
  LinkMoved = "LinkMoved",
  DrawingLink = "DrawingLink",
  PickRequested = "PickRequested",
  RebuildTreeRequested = "RebuildTreeRequested",
  RenderRequested = "RenderRequested",
  SerialisationRequested = "SerialisationRequested",
  UndoRequested = "UndoRequested",
  RedoRequested = "RedoRequested",
  DataModelChanged = "DataModelChanged",
  ViewModelChanged = "ViewModelChanged",
  PanRequested = "PanRequested",
  CenterPanRequested = "CenterPanRequested",
  MenuRequested = "MenuRequested",
  MenuItemClicked = "MenuItemClicked",
  CenterOnNode = "CenterOnNode"
  // ...
}
