import { EventBus } from "@eventBus";
import { ScreenPosition } from "@io";
import { DiagramTheme, Node, UIState } from "@models";
import { ConfigurationManager } from "@configuration";

const PAN_EPSILON = 2;

/**
 * UIManager:
 *
 * Main zoom/pan class
 */
export class UIManager {
  autoPanSmoothing: number;
  constructor(
    private state: UIState,
    private eventBus: EventBus,
    private theme: DiagramTheme
  ) {
    this.eventBus.subscribe("ScreenMouseMove", this.mouseMove);
    this.eventBus.subscribe("ScreenMouseOverMove", this.mouseOverMove);
    this.eventBus.subscribe("ScreenMouseWheel", this.mouseWheel);
    this.eventBus.subscribe("ScreenMouseDrag", this.mouseDrag);
    this.eventBus.subscribe("ScreenLeftMouseClick", this.LMBPressed);
    this.eventBus.subscribe("ScreenLeftMouseUp", this.LMBUp);
    this.eventBus.subscribe("PanRequested", this.panTo);
    this.eventBus.subscribe("CenterPanRequested", this.centerPanTo);
    this.eventBus.subscribe("CenterOnNode", this.centerOnNode);

    this.autoPanSmoothing = ConfigurationManager.instance.getOption(
      "autoPanSmoothing"
    );
  }

  mouseWheel = ({
    delta,
    position,
  }: {
    delta: number;
    position: ScreenPosition;
  }) => {
    if (this.state.animatingPan) {
      return false;
    }

    const scaleChange = delta / -800.0;

    let newScale = this.state.scale + scaleChange;

    if (newScale < 0.3) {
      newScale = 0.3;
    }

    if (newScale > 1.5) {
      newScale = 1.5;
    }

    this.state.panX =
      this.state.panX + position.x / newScale - position.x / this.state.scale;
    this.state.panY =
      this.state.panY + position.y / newScale - position.y / this.state.scale;

    this.state.scale = newScale;
    this.eventBus.publish("ViewModelChanged", this.getViewModel());
  };

  calculateAnimations = (timeCoefficient: number) => {
    if (!this.state.animatingPan) {
      return false;
    }
    if (!this.state.targetPanX || !this.state.targetPanY) {
      return;
    }
    if (!this.state.panX || !this.state.panY) {
      return;
    }
    const [deltaX, deltaY] = [
      this.state.targetPanX - this.state.panX,
      this.state.targetPanY - this.state.panY,
    ];

    if (Math.abs(deltaX) < PAN_EPSILON && Math.abs(deltaY) < PAN_EPSILON) {
      this.state.panX = this.state.targetPanX;
      this.state.panY = this.state.targetPanY;

      this.state.animatingPan = false;
      return false;
    }

    this.state.panX +=
      deltaX / Math.max(this.autoPanSmoothing / timeCoefficient, 1.0);
    this.state.panY +=
      deltaY / Math.max(this.autoPanSmoothing / timeCoefficient, 1.0);

    this.eventBus.publish("ViewModelChanged", this.getViewModel());
    return true;
  };

  worldToScreen = ({
    position,
  }: {
    position: ScreenPosition;
  }): ScreenPosition => {
    return {
      x: (position.x + this.state.panX) * this.state.scale,
      y: (position.y + this.state.panY) * this.state.scale,
      shiftKey: position.shiftKey,
    };
  };
  screenToWorld = ({
    position,
  }: {
    position: ScreenPosition;
  }): ScreenPosition => {
    return {
      x: position.x / this.state.scale - this.state.panX,
      y: position.y / this.state.scale - this.state.panY,
      shiftKey: position.shiftKey,
    };
  };

  centerOnNode = ({ node }: { node: Node }) => {
    if (!this.autoPanSmoothing) {
      this.state.panX =
        -(node.x + this.theme.node.width / 2) +
        this.state.areaSize.width / 2 / this.state.scale;
      this.state.panY =
        -(node.y + this.theme.node.height / 2) +
        this.state.areaSize.height / 2 / this.state.scale;
    } else {
      this.state.targetPanX =
        -(node.x + this.theme.node.width / 2) +
        this.state.areaSize.width / 2 / this.state.scale;
      this.state.targetPanY =
        -(node.y + this.theme.node.height / 2) +
        this.state.areaSize.height / 2 / this.state.scale;
      this.state.animatingPan = true;
    }
    this.eventBus.publish("ViewModelChanged", this.getViewModel());
  };

  mouseOverMove = ({ position }: { position: ScreenPosition }) => {
    this.eventBus.publish("WorldMouseOverMove", {
      position: this.screenToWorld({ position }),
    });
  };

  mouseMove = ({ position }: { position: ScreenPosition }) => {
    this.eventBus.publish("WorldMouseMove", {
      position: this.screenToWorld({ position }),
    });
  };

  mouseDrag = ({ position }: { position: ScreenPosition }) => {
    const calculated = this.screenToWorld({ position });
    this.eventBus.publish("WorldMouseDrag", {
      withoutPan: {
        x: calculated.x + this.state.panX,
        y: calculated.y + this.state.panY,
        shiftKey: calculated.shiftKey,
      },
      calculated,
    });
  };

  getViewModel() {
    return {
      pan: {
        x: this.state.panX,
        y: this.state.panY,
      },
      scale: this.state.scale,
    };
  }

  LMBUp = ({ position }: { position: ScreenPosition }) => {
    if (this.state.draggingElements) {
      this.eventBus.publish("WorldMouseDragEnd");
    }
    if (this.state.draggingWorld) {
      this.eventBus.publish("ViewModelChanged", this.getViewModel());
    }
    this.eventBus.publish("WorldLeftMouseUp", {
      position: this.screenToWorld({ position }),
    });
    this.state.draggingWorld = false;
    this.state.draggingElements = false;
    this.state.draggingMinimap = false;
  };

  LMBPressed = ({ position }: { position: ScreenPosition }) => {
    this.state.lastDragPosition = {
      x: position.x / this.state.scale,
      y: position.y / this.state.scale,
    };

    this.eventBus.publish("WorldLeftMouseClick", {
      position: this.screenToWorld({ position }),
    });
  };

  panScreen = ({ position }: { position: ScreenPosition }) => {
    console.log("pan");
    if (!this.state.lastDragPosition) {
      return;
    }
    this.state.animatingPan = false;
    this.state.draggingWorld = true;
    this.state.panX -= this.state.lastDragPosition.x - position.x;
    this.state.panY -= this.state.lastDragPosition.y - position.y;
    this.state.lastDragPosition = { ...position };
    this.eventBus.publish("ViewModelChanged", this.getViewModel());
  };
  panTo = ({ position }: { position: ScreenPosition }) => {
    this.state.panX = -position.x;
    this.state.panY = -position.y;
    this.eventBus.publish("ViewModelChanged", this.getViewModel());
  };
  centerPanTo = ({ position }: { position: ScreenPosition }) => {
    this.state.panX = position.x + this.state.areaSize.width / 2.0;
    this.state.panY = position.y + this.state.areaSize.height / 2.0;
    this.eventBus.publish("ViewModelChanged", this.getViewModel());
  };
}
