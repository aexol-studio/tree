import { Graph } from "../Models/Graph";

export class RectanglePacker {
  size: number;
  largerSize: "width" | "height";
  constructor(blocks: Graph[]) {
    const heights = blocks.map(b => b.height);
    const widths = blocks.map(b => b.width);
    const maxHeight = Math.max(
      Math.max(...heights),
      Math.sqrt(heights.reduce((a, b) => a + b))
    );
    const maxWidth = Math.max(
      Math.max(...widths),
      Math.sqrt(widths.reduce((a, b) => a + b))
    );
    // Square side size
    if (maxHeight > maxWidth) {
      this.largerSize = "height";
      this.size = maxHeight;
      blocks.sort((a, b) => b.height - a.height);
      const level = {
        x: 0,
        y: 0
      };
      const size = {
        w: 0,
        h: 0
      };
      for (const b of blocks) {
        size.h += b.height;
        if (b.width > size.w) size.w = b.width;
        if (size.h > this.size) {
          level.x += size.w;
          level.y = 0;
          size.h = 0;
          size.w = 0;
        }
      }
    } else {
      this.largerSize = "width";
      this.size = maxWidth;
      blocks.sort((a, b) => b.width - a.width);
    }
  }
}
