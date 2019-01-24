import { DiagramTheme } from "../Models";
import { RoundedRectangle } from "./Draw/RoundedRectangle";
import { MultilineText } from "./Draw/MultilineText";

export class HelpRenderer {
  constructor(
    private context: CanvasRenderingContext2D,
    private theme: DiagramTheme
  ) {}

  getNodeFont(size: number, weight = "normal") {
    return `${weight} ${size}px ${
      this.context.font.split(" ")[this.context.font.split(" ").length - 1]
    }`;
  }
  render(help: { title: string; text: string }) {
    this.context.fillStyle = this.theme.colors.menu.background;
    const { width } = this.context.canvas;
    const basePadding = this.theme.minimap.margin;
    const helpWidth = width - this.theme.minimap.size - basePadding * 3;
    const helpTextWidth = helpWidth - basePadding * 4;
    const {
      help: { text, title, lineHeight: helpLineHeight },
      colors: {
        help: {
          background: backgroundColor,
          text: textColor,
          title: titleColor
        }
      }
    } = this.theme;
    const x = basePadding;
    const y = basePadding;
    this.context.fillStyle = backgroundColor;
    const lineCount = Math.ceil(
      this.context.measureText(help.text).width / helpTextWidth
    );
    RoundedRectangle(this.context, {
      height: lineCount * helpLineHeight + title.text * 2 + basePadding * 4,
      width: helpWidth,
      x,
      y,
      radius: 5
    });
    this.context.textAlign = "left";
    this.context.textBaseline = "top";
    this.context.fillStyle = titleColor;
    this.context.font = this.getNodeFont(title.text, "bold");
    this.context.fillText(help.title, x + basePadding * 2, y + basePadding * 2);
    this.context.fillStyle = textColor;
    this.context.font = this.getNodeFont(text, "100");
    MultilineText(this.context, {
      x: x + basePadding * 2,
      y: y + basePadding * 2 + title.text * 2,
      lineHeight: helpLineHeight,
      width: helpTextWidth,
      text: help.text
    });
  }
}
