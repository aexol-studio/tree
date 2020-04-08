/**
 * DiagramEvents:
 *
 * Set of diagram-specific events, e.g. node was moved or link was created
 * Used possibly to indicate that diagram state have changed
 */
export enum DiagramEvents {
  BeautifyRequested = "BeautifyRequested",
  BeautifySoftRequested = "BeautifySoftRequested",
  CenterPanRequested = "CenterPanRequested",
  CenterOnNode = "CenterOnNode",
  DataModelChanged = "DataModelChanged",
  DescriptionRenameShowInput = "DescriptionRenameShowInput",
  DescriptionRenameEnded = "DescriptionRenameEnded",
  DescriptionRenameFocus = "DescriptionRenameFocus",
  DescriptionMakeReadOnly = "DescriptionMakeReadOnly",
  DescriptionMakeEditable = "DescriptionMakeEditable",
  DrawingLink = "DrawingLink",
  MenuRequested = "MenuRequested",
  MenuItemClicked = "MenuItemClicked",
  NodeCreationRequested = "NodeCreationRequested",
  NodeMoved = "NodeMoved",
  NodeSelected = "NodeSelected",
  NodeCreated = "NodeCreated",
  NodeDeleted = "NodeDeleted",
  NodeChanged = "NodeChanged",
  NodeRenameFocus = "NodeRenameFocus",
  NodeRenameShowInput = "NodeRenameShowInput",
  NodeRenameEnded = "NodeRenameEnded",
  LinkCreated = "LinkCreated",
  LinkDeleted = "LinkDeleted",
  LinkMoved = "LinkMoved",
  PanRequested = "PanRequested",
  PickRequested = "PickRequested",
  RebuildTreeRequested = "RebuildTreeRequested",
  RedoRequested = "RedoRequested",
  RenderRequested = "RenderRequested",
  ScreenShotRendered = "ScreenShotRendered",
  SerialisationRequested = "SerialisationRequested",
  UndoRequested = "UndoRequested",
  ViewModelChanged = "ViewModelChanged"
  // ...
}
