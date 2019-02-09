import { Graph } from "../Models/Graph";
import { ScreenPosition } from "../IO/ScreenPosition";

export class RectanglePacker {
  static pack(blocks: Graph[], e: ScreenPosition = { x: 0, y: 0 }) {
    const heights = blocks.map(b => b.height);
    const widths = blocks.map(b => b.width);
    const totalHeight = heights.reduce((a, b) => a + b);
    const totalWidth = widths.reduce((a, b) => a + b);
    const maxHeight = Math.max(Math.max(...heights), Math.sqrt(totalHeight));
    const maxWidth = Math.max(Math.max(...widths), Math.sqrt(totalWidth));
    const size = Math.max(maxHeight, maxWidth);
    const center = { x: 0, y: 0 };
    let maxY = 0;
    blocks.sort((a, b) => a.width - b.width);
    blocks.forEach(b => {
      if (center.x > size) {
        center.x = 0;
        center.y += maxY;
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
      center.x += b.width;
      maxY = maxY < b.height ? b.height : maxY;
    });
  }
}
