/**
 * DiagramEvents:
 *
 * Set of diagram-specific events, e.g. node was moved or link was created
 * Used possibly to indicate that diagram state have changed
 */
export class DiagramEvents {
  static NodeMoved = "NodeMoved";
  static NodeSelected = "NodeSelected";
  static NodeHover = "NodeHover";
  static NodeCreated = "NodeCreated";
  static NodeDeleted = "NodeDeleted";
  static NodeChanged = "NodeChanged";
  static LinkCreated = "LinkCreated";
  static LinkDeleted = "LinkDeleted";
  static LinkMoved = "LinkMoved";
  static DrawingLink = "DrawingLink";
  static PickRequested = "PickRequested";
  static RebuildTreeRequested = "RebuildTreeRequested";
  static RenderRequested = "RenderRequested";
  static SerialisationRequested = "SerialisationRequested";
  // ...
}
