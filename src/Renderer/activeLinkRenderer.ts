import { DiagramTheme } from "../Models";
import { ScreenPosition } from "../IO/ScreenPosition";
import { QuadraticPath } from "./Draw/QuadraticPath";
export class ActiveLinkRenderer {
  constructor(
    private context: CanvasRenderingContext2D,
    private theme: DiagramTheme
  ) {}
  render = ({ from, to }: { from: ScreenPosition; to: ScreenPosition }) => {
    QuadraticPath(
      this.context,
      from.x,
      from.y,
      to.x,
      to.y,
      this.theme.link.cornerRadius,
      this.theme.link.strokeWidth,
      this.theme.colors.link.main,
      this.theme.link.defaultCenterPoint
    );
  };
}
