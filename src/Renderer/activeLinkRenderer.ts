import { DiagramTheme } from "../Models";
import { ScreenPosition } from "../IO/ScreenPosition";
import { QuadraticPath } from "./Draw/QuadraticPath";
import { ContextProvider } from "./ContextProvider";
export class ActiveLinkRenderer {
  constructor(
    private contextProvider: ContextProvider,
    private theme: DiagramTheme
  ) {}
  render = ({ from, to }: { from: ScreenPosition; to: ScreenPosition }) => {
    QuadraticPath(
      this.contextProvider.context,
      from.x,
      from.y,
      to.x,
      to.y,
      this.theme.link.cornerRadius,
      this.theme.link.strokeWidth,
      this.theme.colors.link.main,
      this.theme.link.defaultCenterPoint,
      from.x === to.x && from.y === to.y
    );
  };
}
