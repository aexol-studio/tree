import { Node, DiagramTheme } from "../Models";
import { Bubble } from "./Draw/Bubble";
export class DescriptionRenderer {
  constructor(
    private context: CanvasRenderingContext2D,
    private theme: DiagramTheme
  ) {}

  getNodeFont(size: number, weight = "normal") {
    return `${weight} ${size}px ${
      this.context.font.split(" ")[this.context.font.split(" ").length - 1]
    }`;
  }
  render = ({ node }: { node: Node }) => {
    if (node.description) {
      this.context.fillStyle = this.theme.colors.description.background;
      Bubble(
        this.context,
        node.x + this.theme.node.width / 2.0,
        node.y,
        this.theme.description.width,
        this.theme.description.height,
        this.theme.description.triangleWidth,
        this.theme.description.triangleHeight
      );
      this.context.fillStyle = this.theme.colors.description.text;
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";

      this.context.fillText(
        node.description,
        node.x + this.theme.node.width / 2.0,
        node.y -
          this.theme.description.triangleHeight -
          this.theme.description.height / 2.0,
        this.theme.description.width
      );
    }
  };
}
