import { ScreenPosition } from "../IO/ScreenPosition";
import { DiagramTheme, Category } from "../Models";
import { RoundedRectangle } from "./Draw/RoundedRectangle";

export class MenuRenderer {
  constructor(
    private context: CanvasRenderingContext2D,
    private theme: DiagramTheme
  ) {}

  getNodeFont(size: number, weight = "normal") {
    return `${weight} ${size}px ${
      this.context.font.split(" ")[this.context.font.split(" ").length - 1]
    }`;
  }
  render(e: ScreenPosition, categories: Category[], item?: number) {
    // Render Background
    this.context.fillStyle = this.theme.colors.menu.background;
    RoundedRectangle(this.context, {
      height: categories.length * this.theme.menu.category.height,
      width: this.theme.menu.width,
      x: e.x,
      y: e.y,
      radius: 5
    });
    categories.forEach((category, index) => {
      this.context.font = this.getNodeFont(
        this.theme.menu.category.textSize,
        "normal"
      );
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      this.context.fillStyle = this.theme.colors.menu.text;
      if (item === index) {
        this.context.fillStyle = this.theme.colors.menu.hover;
      }
      const categoryY = e.y + this.theme.menu.category.height * index;
      this.context.fillText(
        category.name,
        e.x + this.theme.menu.width / 2.0,
        categoryY + this.theme.menu.category.height / 2.0
      );
      if (index !== categories.length - 1) {
        this.context.beginPath();
        this.context.moveTo(e.x, categoryY + this.theme.menu.category.height);
        this.context.lineTo(
          e.x + this.theme.menu.width,
          categoryY + this.theme.menu.category.height
        );
        this.context.stroke();
      }
    });
  }
}
