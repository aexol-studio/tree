/**
 * IOEvents:
 *
 * Set of IO-specific events, e.g. mouse button or key was pressed
 * Used by IO service to put events on a bus
 */
export class UIEvents {
  static UIMouseMove = "UIMouseMove";
  static UIMouseDrag = "UIMouseDrag";
  static MouseOverMove = "UIMouseOverMove";
  static LeftMouseUp = "UILeftMouseUp";
  static RightMouseUp = "UIRightMouseUp";
  static UILeftMouseClick = "UILeftMouseClick";
  static DoubleClick = "UIDoubleClick";
  static RightMouseClick = "UIRightMouseClick";
  static MPressed = "UIMPressed";
  static DeletePressed = "UIDelete";
  static RenamerChanged = "UIRenamerChanged";
}
