import { ScreenPosition } from "@io";

/**
 * IOEvents:
 *
 * Set of IO-specific events, e.g. mouse button or key was pressed
 * Used by IO service to put events on a bus
 */
export type IOEvents = keyof IOEventsPayloads;

export interface IOEventsPayloads {
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
