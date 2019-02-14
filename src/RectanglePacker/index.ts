import { Graph, DiagramTheme } from "../Models";
import { ScreenPosition } from "../IO/ScreenPosition";

export class RectanglePacker {
  static pack(
    blocks: Graph[],
    theme: DiagramTheme,
    e: ScreenPosition = { x: 0, y: 0 }
  ) {
    const heights = blocks.map(b => b.height);
    const widths = blocks.map(b => b.width);
    const totalHeight = heights.reduce((a, b) => a + b);
    const totalWidth = widths.reduce((a, b) => a + b);
    const maxHeight = Math.max(Math.max(...heights), Math.sqrt(totalHeight));
    const maxWidth = Math.max(Math.max(...widths), Math.sqrt(totalWidth));
    const size = Math.max(maxHeight, maxWidth);
    const center = { x: 0, y: 0 };
    let maxY = 0;
    blocks.sort((a, b) => a.height - b.height);
    blocks.forEach(b => {
      if (center.x > size) {
        center.x = 0;
        center.y += maxY + theme.graph.spacing.y;
        maxY = 0;
      }
      const newPosition = {
        x: center.x,
        y: center.y
      };
      b.nodes.forEach(node => {
        (node.x += newPosition.x), (node.y += newPosition.y);
      });
      b.center.x += newPosition.x;
      b.center.y += newPosition.y;
      center.x += b.width + theme.graph.spacing.x;
      maxY = maxY < b.height ? b.height : maxY;
    });
  }
}
