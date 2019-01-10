import { DiagramTheme, Link } from "../Models";
import { QuadraticPath } from "./Draw/QuadraticPath";
export class LinkRenderer {
  constructor(
    private context: CanvasRenderingContext2D,
    private theme: DiagramTheme
  ) {}
  render = (l: Link, highlight?: boolean) => {
    const {
      node: { width, height }
    } = this.theme;
    QuadraticPath(
      this.context,
      l.o.x + width / 2.0,
      l.o.y + height / 2.0,
      l.i.x + width / 2.0,
      l.i.y + height / 2.0,
      this.theme.link.cornerRadius,
      this.theme.link.strokeWidth,
      highlight ? this.theme.colors.link.active : this.theme.colors.link.main,
      l.centerPoint || this.theme.link.defaultCenterPoint
    );
  };
}
