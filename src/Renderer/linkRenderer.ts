import { DiagramTheme, Link } from "../Models";
import { QuadraticPath } from "./Draw/QuadraticPath";
export class LinkRenderer {
  constructor(
    private context: CanvasRenderingContext2D,
    private theme: DiagramTheme
  ) {}
  render = (l: Link, status: keyof DiagramTheme["colors"]["link"]) => {
    const {
      node: { width, height }
    } = this.theme;
    QuadraticPath(
      this.context,
      l.o.x + width,
      l.o.y + height / 2.0,
      l.i.x,
      l.i.y + height / 2.0,
      this.theme.link.cornerRadius,
      this.theme.link.strokeWidth,
      this.theme.colors.link[status],
      l.centerPoint || this.theme.link.defaultCenterPoint
    )
  };
}
