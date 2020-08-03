import { Link, DiagramTheme } from "@models";
import { DefaultDiagramTheme } from "@theme/DefaultDiagramTheme";

export class LinkUtils {
  static calculateLinkCenterPoint = <T extends { x: number }>(
    link: Link,
    e: T,
    theme: DiagramTheme = DefaultDiagramTheme
  ) => {
    const startX = link.o.x + theme.node.width;
    return (e.x - startX) / (link.i.x - startX);
  };
  static calculateLinkXCenter = (
    link: Link,
    theme: DiagramTheme = DefaultDiagramTheme
  ) => {
    return LinkUtils.calculateLinkXCenterMath(
      link.o.x + theme.node.width,
      link.i.x,
      link.centerPoint
    );
  };
  static calculateLinkXCenterMath = (
    x1: number,
    x2: number,
    centerPoint: number
  ) => {
    const distance = (x1 - x2) * centerPoint;
    return x1 - distance;
  };
}
