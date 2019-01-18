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
  static LinkCreated = "LinkCreated";
  static DrawingLink = "DrawingLink";
  static RenderRequested = "RenderRequested";
  // ...
}
