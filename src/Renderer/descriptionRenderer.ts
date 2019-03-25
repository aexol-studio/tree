import { Node, DiagramTheme } from "../Models";
import { Bubble } from "./Draw/Bubble";
import { MultilineText, TextInLines } from "./Draw/MultilineText";
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
      const {
        fontSize,
        lineHeight,
        paddingHorizontal,
        paddingVertical,
        triangleHeight,
        triangleWidth,
        triangleDistance,
        width
      } = this.theme.description;
      const textWidth = width - paddingHorizontal * 2;
      this.context.fillStyle = this.theme.colors.description.background;
      const lineCount = TextInLines(this.context, {
        width: textWidth,
        text: node.description
      });
      const bubbleHeight = paddingVertical * 2 + lineHeight * lineCount;
      Bubble(
        this.context,
        node.x + this.theme.node.width / 2.0,
        node.y - triangleDistance,
        width,
        bubbleHeight,
        triangleWidth,
        triangleHeight
      );
      this.context.fillStyle = this.theme.colors.description.text;
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      this.context.font = this.getNodeFont(fontSize, "normal");
      MultilineText(this.context, {
        x: node.x + this.theme.node.width / 2.0,
        y:
          node.y -
          triangleDistance -
          triangleHeight -
          bubbleHeight +
          paddingVertical * 2,
        lineHeight,
        text: node.description,
        width: textWidth
      });
    }
  };
}
