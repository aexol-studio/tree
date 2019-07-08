/**
 * IOEvents:
 *
 * Set of IO-specific events, e.g. mouse button or key was pressed
 * Used by IO service to put events on a bus
 */
export enum IOEvents {
  ScreenMouseLeave = "ScreenMouseLeave",
  ScreenMouseMove = "ScreenMouseMove",
  ScreenMouseDrag = "ScreenMouseDrag",
  ScreenMouseOverMove = "ScreenMouseOverMove",
  ScreenLeftMouseUp = "ScreenLeftMouseUp",
  ScreenRightMouseUp = "ScreenRightMouseUp",
  ScreenLeftMouseClick = "ScreenLeftMouseClick",
  ScreenDoubleClick = "ScreenDoubleClick",
  ScreenMouseWheel = "ScreenMouseWheel",

  WorldMouseMove = "WorldMouseMove",
  WorldMouseOverMove = "WorldMouseOverMove",
  WorldMouseDrag = "WorldMouseDrag",
  WorldMouseDragEnd = "WorldMouseDragEnd",
  WorldLeftMouseClick = "WorldLeftMouseClick",
  WorldLeftMouseUp = "WorldLeftMouseUp",

  MinimapMouseMove = "MinimapMouseMove",
  MinimapLeftMouseClick = "MinimapLeftMouseClick",

  ScreenRightMouseClick = "ScreenRightMouseClick",
  MPressed = "MPressed",
  DeletePressed = "Delete",
  RenamerChanged = "RenamerChanged"
}
