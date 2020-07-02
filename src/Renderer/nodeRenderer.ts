import { Node, DiagramTheme } from "@models";
import {
  RoundedRectangle,
  RoundedRectangleStroke,
} from "./Draw/RoundedRectangle";
import {
  ConfigurationManager,
  DiagramDrawingDistanceOptions,
} from "@configuration";
import { StateManager } from "@diagram/stateManager";
import { ContextProvider } from "./ContextProvider";
export class NodeRenderer {
  distances: DiagramDrawingDistanceOptions;

  constructor(
    private contextProvider: ContextProvider,
    private theme: DiagramTheme,
    private stateManager: StateManager
  ) {
    this.distances = ConfigurationManager.instance.getOption(
      "drawingDistance"
    ) as DiagramDrawingDistanceOptions;
  }

  getNodeFont(size: number, weight = "normal") {
    return `${weight} ${size}px ${this.theme.fontFamily}`;
  }
  render = ({
    node,
    typeIsHovered,
    isHovered,
    isSelected,
    isRenamed,
    isNodeMenuOpened,
    inputActive,
    outputActive,
    currentScale = 1.0,
  }: {
    node: Node;
    typeIsHovered?: boolean;
    isHovered?: boolean;
    isSelected?: boolean;
    isRenamed?: boolean;
    isNodeMenuOpened?: boolean;
    outputActive?: boolean;
    inputActive?: boolean;
    currentScale?: number;
  }) => {
    if (!node.hidden) {
      const {
        colors,
        node: { width, height, nameSize, typeSize, options },
        port,
      } = this.theme;
      const isReadOnly =
        this.stateManager.pureState().isReadOnly || node.readonly;
      this.context.fillStyle = colors.node.background;
      const leftRadius = node.inputs ? 0 : 5;
      const rightRadius = node.outputs ? 0 : 5;
      RoundedRectangle(this.context, {
        width,
        height,
        x: node.x,
        y: node.y,
        radius: 0,
        radiusBottomLeft: leftRadius,
        radiusTopLeft: leftRadius,
        radiusBottomRight: rightRadius,
        radiusTopRight: rightRadius,
      });

      const {
        nodeType: distanceNodeType,
        nodeTitle: distanceNodeTitle,
        nodeOptions: distanceNodeOptions,
        nodeArrows: distanceNodeArrows,
      } = this.distances;

      if (currentScale > distanceNodeType) {
        this.context.fillStyle =
          colors.node.types[node.definition.type] || colors.node.type;
        let typeContent = node.definition.type;
        if (typeIsHovered && node.definition.parent) {
          this.context.fillStyle = colors.node.hover.type;
          typeContent += " >";
        }
        this.context.font = this.getNodeFont(typeSize, "normal");
        this.context.textBaseline = "bottom";
        this.context.textAlign = "end";
        this.context.fillText(typeContent, node.x + width, node.y);
      } else {
        this.context.fillStyle =
          colors.node.types[node.definition.type] || colors.node.type;
        this.context.fillRect(
          node.x + width - width / 4.0,
          node.y - typeSize / 1.5 - 2,
          width / 4.0,
          typeSize / 1.5
        );
      }

      if (node.inputs) {
        this.context.font = this.getNodeFont(nameSize, "normal");
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";

        this.context.fillStyle = inputActive
          ? colors.port.backgroundActive
          : colors.port.background;
        RoundedRectangle(this.context, {
          height,
          width: port.width,
          x: node.x - port.width,
          y: node.y,
          radiusTopLeft: 10,
          radiusBottomLeft: 10,
        });
        if (currentScale > distanceNodeArrows && !isReadOnly) {
          this.context.fillStyle = colors.port.button;
          this.context.font = this.getNodeFont(12, "normal");
          this.context.fillText(
            "◀",
            node.x - port.width / 2.0,
            node.y + height / 2.0 + 2
          );
        }
        this.context.fillStyle = colors.background;
        port.gap &&
          RoundedRectangle(this.context, {
            height,
            width: port.gap,
            x: node.x,
            y: node.y,
            radius: 0,
          });
      }
      if (node.outputs) {
        this.context.fillStyle = outputActive
          ? colors.port.backgroundActive
          : colors.port.background;
        RoundedRectangle(this.context, {
          height,
          width: port.width,
          x: node.x + width,
          y: node.y,
          radiusTopRight: 10,
          radiusBottomRight: 10,
        });
        if (currentScale > distanceNodeArrows && !isReadOnly) {
          this.context.fillStyle = colors.port.button;
          this.context.font = this.getNodeFont(12, "normal");
          this.context.fillText(
            "▶",
            node.x + width + port.width / 2.0,
            node.y + height / 2.0 + 2
          );
        }
        this.context.fillStyle = colors.background;
        port.gap &&
          RoundedRectangle(this.context, {
            height,
            width: port.gap,
            x: node.x + width,
            y: node.y,
            radius: 0,
          });
      }
      if (node.options && currentScale > distanceNodeOptions) {
        let xCounter = 0;
        node.options.forEach((o) => {
          this.context.fillStyle = colors.node.options[o] || colors.node.name;
          this.context.font = this.getNodeFont(options.fontSize, "normal");
          this.context.textAlign = "left";
          this.context.fillText(
            o,
            node.x + xCounter,
            node.y + height + options.fontSize,
            width
          );
          xCounter += this.context.measureText(o).width + options.fontSize / 2;
        });
      }
      if (node.name && !isRenamed) {
        this.context.fillStyle = colors.node.name;
        if (currentScale > distanceNodeTitle) {
          this.context.font = this.getNodeFont(nameSize, "normal");
          this.context.textAlign = "center";
          this.context.textBaseline = "middle";
          this.context.fillText(
            node.name,
            node.x + width / 2.0,
            node.y + height / 2.0
          );
        } else {
          this.context.fillStyle = `${colors.node.name}55`;
          const rectWidth = width / 2.0;
          const rectHeight = nameSize / 1.5;
          this.context.fillRect(
            node.x + width / 2.0 - rectWidth / 2.0,
            node.y + height / 2.0 - rectHeight / 2.0,
            rectWidth,
            rectHeight
          );
        }
      }
      const radiusRight = node.outputs ? 10 : 0;
      const radiusLeft = node.inputs ? 10 : 0;
      let hoverWidth = width;
      let hoverX = node.x;
      if (node.inputs) {
        hoverX -= port.width;
        hoverWidth += port.width;
      }
      if (node.outputs) {
        hoverWidth += port.width;
      }
      if (isHovered || isSelected) {
        this.context.strokeStyle = isNodeMenuOpened
          ? colors.node.menuOpened
          : colors.node.selected;
        this.context.lineWidth = 2;
        RoundedRectangleStroke(this.context, {
          width: hoverWidth,
          height,
          x: hoverX,
          y: node.y,
          radius: 0,
          radiusBottomLeft: radiusLeft,
          radiusTopLeft: radiusLeft,
          radiusBottomRight: radiusRight,
          radiusTopRight: radiusRight,
        });
      }
      if (isSelected) {
        this.context.fillStyle = isNodeMenuOpened
          ? `${colors.node.menuOpened}17`
          : `${colors.node.selected}17`;
        RoundedRectangle(this.context, {
          width: hoverWidth,
          height,
          x: hoverX,
          y: node.y,
          radiusBottomLeft: radiusLeft,
          radiusTopLeft: radiusLeft,
          radiusBottomRight: radiusRight,
          radiusTopRight: radiusRight,
        });
      }
    }
  };

  get context() {
    return this.contextProvider.context;
  }
}
