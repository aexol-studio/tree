import { EventBus } from "../../../EventBus";
import { UIState } from "../../../Models/UIState";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import * as Events from "../../../Events";
import { DiagramTheme, Node } from "../../../Models";

/**
 * UIManager:
 *
 * Main zoom/pan class
 */
export class UIManager {
  constructor(
    private state: UIState,
    private eventBus: EventBus,
    private theme: DiagramTheme
  ) {
    this.eventBus.subscribe(Events.IOEvents.ScreenMouseMove, this.mouseMove);
    this.eventBus.subscribe(
      Events.IOEvents.ScreenMouseOverMove,
      this.mouseOverMove
    );
    this.eventBus.subscribe(Events.IOEvents.ScreenMouseWheel, this.mouseWheel);
    this.eventBus.subscribe(Events.IOEvents.ScreenMouseDrag, this.mouseDrag);
    this.eventBus.subscribe(
      Events.IOEvents.ScreenLeftMouseClick,
      this.LMBPressed
    );
    this.eventBus.subscribe(Events.IOEvents.ScreenLeftMouseUp, this.LMBUp);
    this.eventBus.subscribe(Events.DiagramEvents.PanRequested, this.panTo);
    this.eventBus.subscribe(
      Events.DiagramEvents.CenterPanRequested,
      this.centerPanTo
    );
    this.eventBus.subscribe(Events.DiagramEvents.CenterOnNode, this.centerOnNode);
  }

  mouseWheel = (delta: number, mouseX: number, mouseY: number) => {
    let scaleChange = delta / -800.0;

    let newScale = this.state.scale + scaleChange;

    if (newScale < 0.3) {
      newScale = 0.3;
    }

    if (newScale > 1.5) {
      newScale = 1.5;
    }

    this.state.panX! =
      this.state.panX! + mouseX / newScale - mouseX / this.state.scale;
    this.state.panY! =
      this.state.panY! + mouseY / newScale - mouseY / this.state.scale;

    this.state.scale = newScale;

    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    this.eventBus.publish(
      Events.DiagramEvents.ViewModelChanged,
      this.getViewModel()
    );
  };

  worldToScreen = (e: ScreenPosition): ScreenPosition => {
    return {
      x: (e.x + this.state.panX!) * this.state.scale,
      y: (e.y + this.state.panY!) * this.state.scale,
      shiftKey: e.shiftKey
    };
  };
  screenToWorld = (e: ScreenPosition): ScreenPosition => {
    return {
      x: e.x / this.state.scale - this.state.panX!,
      y: e.y / this.state.scale - this.state.panY!,
      shiftKey: e.shiftKey
    };
  };

  centerOnNode = (n: Node) => {
    this.state.panX = -(n.x - this.state.areaSize.width / 2 + this.theme.node.width / 2);
    this.state.panY = -(n.y - this.state.areaSize.height / 2 + this.theme.node.height / 2);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };

  calculateMinimapPosition = (e: ScreenPosition) => {
    const minimapConstraints = {
      left:
        this.state.areaSize.width -
        this.theme.minimap.size -
        this.theme.minimap.margin,
      right: this.state.areaSize.width - this.theme.minimap.margin,
      top: this.theme.minimap.margin,
      bottom: this.theme.minimap.margin + this.theme.minimap.size
    };

    if (
      e.x > minimapConstraints.left &&
      e.x < minimapConstraints.right &&
      e.y > minimapConstraints.top &&
      e.y < minimapConstraints.bottom
    ) {
      return {
        x: e.x - minimapConstraints.left,
        y: e.y - minimapConstraints.top
      };
    }

    return null;
  };
  mouseOverMove = (e: ScreenPosition) => {
    const minimapPosition = this.calculateMinimapPosition(e);
    if (minimapPosition && !this.state.draggingWorld) {
      return;
    }
    this.eventBus.publish(
      Events.IOEvents.WorldMouseOverMove,
      this.screenToWorld(e)
    );
  };

  mouseMove = (e: ScreenPosition) => {
    const minimapPosition = this.calculateMinimapPosition(e);

    if (minimapPosition && !this.state.draggingWorld) {
      this.eventBus.publish(Events.IOEvents.MinimapMouseMove, minimapPosition);
      return;
    }

    this.eventBus.publish(
      Events.IOEvents.WorldMouseMove,
      this.screenToWorld(e)
    );
  };

  mouseDrag = (e: ScreenPosition) => {
    const isInsideMinimap = this.calculateMinimapPosition(e);
    if (isInsideMinimap && !this.state.draggingElements) {
      return;
    }
    const calculated = this.screenToWorld(e);
    this.eventBus.publish(Events.IOEvents.WorldMouseDrag, {
      withoutPan: {
        x: calculated.x + this.state.panX!,
        y: calculated.y + this.state.panY!,
        shiftKey: calculated.shiftKey
      },
      calculated
    });
  };

  getViewModel() {
    return {
      pan: {
        x: this.state.panX,
        y: this.state.panY
      },
      scale: this.state.scale
    };
  }

  LMBUp = (e: ScreenPosition) => {
    if (this.state.draggingElements) {
      this.eventBus.publish(Events.IOEvents.WorldMouseDragEnd);
    }
    if (this.state.draggingWorld) {
      this.eventBus.publish(
        Events.DiagramEvents.ViewModelChanged,
        this.getViewModel()
      );
    }
    this.eventBus.publish(
      Events.IOEvents.WorldLeftMouseUp,
      this.screenToWorld(e)
    );
    this.state.draggingWorld = false;
    this.state.draggingElements = false;
    this.state.draggingMinimap = false;
  };

  LMBPressed = (e: ScreenPosition) => {
    const coordsInsideMinimap = this.calculateMinimapPosition(e);

    if (coordsInsideMinimap) {
      this.eventBus.publish(
        Events.IOEvents.MinimapLeftMouseClick,
        coordsInsideMinimap
      );
      return;
    }

    this.state.lastDragPosition = {
      x: e.x / this.state.scale,
      y: e.y / this.state.scale
    };

    this.eventBus.publish(
      Events.IOEvents.WorldLeftMouseClick,
      this.screenToWorld(e),
      {
        x: this.state.panX,
        y: this.state.panY
      }
    );
  };

  panScreen = (e: ScreenPosition) => {
    this.state.draggingWorld = true;
    this.state.panX! -= this.state.lastDragPosition!.x - e.x;
    this.state.panY! -= this.state.lastDragPosition!.y - e.y;
    this.state.lastDragPosition = { ...e };
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  panTo = (e: ScreenPosition) => {
    this.state.panX! = -e.x;
    this.state.panY! = -e.y;
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  centerPanTo = (e: ScreenPosition) => {
    this.state.panX! = -e.x + this.state.areaSize.width / 2.0;
    this.state.panY! = -e.y + this.state.areaSize.height / 2.0;
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
}
