import { Node, DiagramTheme } from "@models";
import {
  RoundedRectangle,
  RoundedRectangleStroke,
} from "./Draw/RoundedRectangle";
import { ContextProvider } from "./ContextProvider";
export class NodeRenderer {
  constructor(
    private contextProvider: ContextProvider,
    private theme: DiagramTheme
  ) {}

  getNodeFont(size: number, weight = "normal") {
    return `${weight} ${size}px ${this.theme.fontFamily}`;
  }
  render = ({
    node,
    typeIsHovered,
    isHovered,
    isSelected,
  }: {
    node: Node;
    typeIsHovered?: boolean;
    isHovered?: boolean;
    isSelected?: boolean;
  }) => {
    if (!node.hidden) {
      const {
        colors,
        node: {
          width: nodeWidth,
          height,
          nameSize,
          typeSize,
          options,
          radius,
          typeYGap,
          padding,
        },
      } = this.theme;

      const width = Math.max(
        nodeWidth,
        this.context.measureText(node.name).width + padding * 2
      );

      this.context.fillStyle =
        colors.node.backgrounds?.[node.type] || colors.node.background;
      RoundedRectangle(this.context, {
        width,
        height,
        x: node.x,
        y: node.y,
        radius,
      });

      this.context.fillStyle =
        colors.node.types?.[node.type] || colors.node.type;
      let typeContent = node.type;
      if (typeIsHovered) {
        this.context.fillStyle = colors.node.hover.type;
        typeContent += " >";
      }
      this.context.font = this.getNodeFont(typeSize, "normal");
      this.context.textBaseline = "bottom";
      this.context.textAlign = "end";
      this.context.fillText(typeContent, node.x + width, node.y - typeYGap);
      if (node.options) {
        let xCounter = 0;
        node.options.forEach((o) => {
          this.context.fillStyle = colors.node.options[o] || colors.node.name;
          this.context.font = this.getNodeFont(options.fontSize, "normal");
          this.context.textAlign = "left";
          this.context.fillText(
            o,
            node.x + xCounter,
            node.y + height + options.fontSize + options.yGap,
            width
          );
          xCounter += this.context.measureText(o).width + options.fontSize / 2;
        });
      }
      if (node.name) {
        this.context.fillStyle = colors.node.name;
        this.context.font = this.getNodeFont(nameSize, "normal");
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(
          node.name,
          node.x + width / 2.0,
          node.y + height / 2.0
        );
      }
      if (isHovered || isSelected) {
        this.context.strokeStyle = colors.node.selected;
        this.context.lineWidth = 2;
        RoundedRectangleStroke(this.context, {
          width,
          height,
          x: node.x,
          y: node.y,
          radius,
        });
      }
      if (isSelected) {
        this.context.fillStyle = `${colors.node.selected}17`;
        RoundedRectangle(this.context, {
          width,
          height,
          x: node.x,
          y: node.y,
          radius,
        });
      }
    }
  };

  get context() {
    return this.contextProvider.context;
  }
}
