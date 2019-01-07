import { DiagramTheme, Link } from "../Models";
import { QuadraticPath } from "./Draw/QuadraticPath";
export class LinkRenderer {
  constructor(
    private context: CanvasRenderingContext2D,
    private theme: DiagramTheme
  ) {}
  render = (l: Link) => {
    QuadraticPath(
      this.context,
      l.from.x,
      l.from.y,
      l.to.x,
      l.to.y,
      this.theme.link.cornerRadius,
      this.theme.link.strokeWidth,
      this.theme.colors.link.main,
      l.centerPoint || this.theme.link.defaultCenterPoint
    );
  };
}
