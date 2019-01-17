/**
 * IOEvents:
 *
 * Set of IO-specific events, e.g. mouse button or key was pressed
 * Used by IO service to put events on a bus
 */
export class IOEvents {
  static LeftMouseClick = "LeftMouseClick";
  static DoubleClick = "DoubleClick";
  static RightMouseClick = "RightMouseClick";

  static ScreenMouseMove = "ScreenMouseMove";
  static ScreenMouseDrag = "ScreenMouseDrag";
  static ScreenMouseOverMove = "ScreenMouseOverMove";
  static ScreenLeftMouseUp = "ScreenLeftMouseUp";
  static ScreenRightMouseUp = "ScreenRightMouseUp";
  static ScreenLeftMouseClick = "ScreenLeftMouseClick";
  static ScreenDoubleClick = "ScreenDoubleClick";
  static ScreenMouseWheel = "ScreenMouseWheel";

  static WorldMouseMove = "WorldMouseMove";
  static WorldMouseDrag = "WorldMouseDrag";
  static WorldLeftMouseClick = "WorldLeftMouseClick";

  static MinimapMouseMove = "MinimapMouseMove";
  static MinimapLeftMouseClick = "MinimapLeftMouseClick";

  static ScreenRightMouseClick = "ScreenRightMouseClick";
  static MPressed = "MPressed";
  static DeletePressed = "Delete";
  static RenamerChanged = "RenamerChanged";
}
