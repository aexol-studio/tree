import { Node, DiagramTheme } from "../Models";
import { RoundedRectangle } from "./Draw/RoundedRectangle";
export class NodeRenderer {
  constructor(
    private context: CanvasRenderingContext2D,
    private theme: DiagramTheme
  ) {}

  getNodeFont(size: number, weight = "normal") {
    return `${weight} ${size}px ${
      this.context.font.split(" ")[this.context.font.split(" ").length - 1]
    }`;
  }
  render = ({
    node,
    isHovered,
    isSelected,
    inputActive,
    outputActive
  }: {
    node: Node;
    isHovered?: boolean;
    isSelected?: boolean;
    outputActive?: boolean;
    inputActive?: boolean;
  }) => {
    const {
      colors,
      node: { width, height, nameSize, typeSize },
      port
    } = this.theme;
    this.context.fillStyle = colors.node.background;
    if (isSelected || isHovered) {
      this.context.fillStyle = colors.node.selected;
    }
    this.context.fillRect(
      node.x! - width / 2.0,
      node.y! - height / 2.0,
      width,
      height
    );
    if (node.name) {
      this.context.fillStyle = colors.node.name;
      this.context.font = this.getNodeFont(nameSize, "normal");
      this.context.textAlign = "center";
      this.context.fillText(node.name, node.x!, node.y! + nameSize / 2.0);
    }
    if (node.type) {
      this.context.fillStyle = colors.node.types[node.type] || colors.node.name;
      this.context.font = this.getNodeFont(typeSize, "normal");
      this.context.textAlign = "end";
      this.context.fillText(
        node.type,
        node.x! + width / 2.0,
        node.y! - height / 2.0 - typeSize / 2.0
      );
    }
    this.context.fillStyle = inputActive
      ? colors.port.backgroundActive
      : colors.port.background;
    RoundedRectangle(this.context, {
      height,
      width: port.width,
      x: node.x - width / 2.0 - port.width,
      y: node.y - height / 2.0,
      radiusTopLeft: 5,
      radiusBottomLeft: 5
    });
    this.context.fillStyle = outputActive
      ? colors.port.backgroundActive
      : colors.port.background;
    RoundedRectangle(this.context, {
      height,
      width: port.width,
      x: node.x + width / 2.0,
      y: node.y - height / 2.0,
      radiusTopRight: 5,
      radiusBottomRight: 5
    });
  };
}
