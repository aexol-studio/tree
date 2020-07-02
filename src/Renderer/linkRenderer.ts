import { DiagramTheme, Link } from "@models";
import { QuadraticPath } from "./Draw/QuadraticPath";
import { SimplifiedPath } from "./Draw/SimplifiedPath";
import {
  DiagramDrawingDistanceOptions,
  ConfigurationManager,
} from "@configuration";
import { ContextProvider } from "./ContextProvider";
export class LinkRenderer {
  distances: DiagramDrawingDistanceOptions;
  constructor(
    private contextProvider: ContextProvider,
    private theme: DiagramTheme
  ) {
    this.distances = ConfigurationManager.instance.getOption(
      "drawingDistance"
    ) as DiagramDrawingDistanceOptions;
  }
  render = (
    l: Link,
    status: keyof DiagramTheme["colors"]["link"],
    currentScale = 1.0
  ) => {
    const {
      node: { width, height },
    } = this.theme;

    const { context } = this.contextProvider;
    if (l.i.hidden || l.o.hidden) {
      return;
    }
    if (currentScale > this.distances.detailedLinks && !l.i.hidden) {
      return QuadraticPath(
        context,
        l.o.x + width,
        l.o.y + height / 2.0,
        l.i.x,
        l.i.y + height / 2.0,
        this.theme.link.cornerRadius,
        this.theme.link.strokeWidth,
        this.theme.colors.link[status],
        l.centerPoint || this.theme.link.defaultCenterPoint,
        l.o.x === l.i.x && l.o.y === l.i.y
      );
    }

    if (currentScale > this.distances.simplifiedLinks && !l.i.hidden) {
      return SimplifiedPath(
        context,
        l.i.x,
        l.i.y + height / 2.0,
        l.o.x + width,
        l.o.y + height / 2.0,
        this.theme.link.strokeWidth,
        this.theme.colors.link[status],
        l.centerPoint || this.theme.link.defaultCenterPoint,
        l.o.x === l.i.x && l.o.y === l.i.y
      );
    }
  };
}
