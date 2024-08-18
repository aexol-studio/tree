import { Graph, DiagramTheme } from "@/models";
import { packBoxes, IndexedDimensions } from "./packer";

export class RectanglePacker {
  static pack(blocks: Graph[], theme: DiagramTheme) {
    const boxes = packBoxes(
      blocks.map(
        (b, index) =>
          ({
            dimensions: [
              b.width + theme.graph.spacing.x,
              b.height + theme.graph.spacing.y,
            ],
            index,
          } as IndexedDimensions)
      )
    );
    boxes.forEach((box) => {
      const block = blocks[box.index];
      const newCenter = {
        x: box.box.position[0] + block.width / 2.0,
        y: box.box.position[1] + block.height / 2.0,
      };
      block.nodes.forEach((node) => {
        const relativePosition = {
          x: node.x - block.center.x,
          y: node.y - block.center.y,
        };
        (node.x = newCenter.x + relativePosition.x),
          (node.y = newCenter.y + relativePosition.y);
      });
      block.center = {
        ...newCenter,
      };
    });
  }
}
