import { Graph, DiagramTheme } from "../Models";
import { packBoxes, IndexedDimensions } from "./packer";

export class RectanglePacker {
  static pack(blocks: Graph[], theme: DiagramTheme) {
    const boxes = packBoxes(
      blocks.map(
        (b, index) =>
          ({
            dimensions: [
              b.width + theme.graph.spacing.x,
              b.height + theme.graph.spacing.y
            ],
            index
          } as IndexedDimensions)
      )
    );
    boxes.forEach(box => {
      const block = blocks[box.index];
      const newCenter = {
        x: box.box.position[0] + block.width / 2.0,
        y: box.box.position[1] + block.height / 2.0
      };
      block.nodes.forEach(node => {
        const relativePosition = {
          x: node.x - block.center.x,
          y: node.y - block.center.y
        };
        (node.x = newCenter.x + relativePosition.x),
          (node.y = newCenter.y + relativePosition.y);
      });
      block.center = {
        ...newCenter
      };
    });
  }
  static softPack(blocks: Graph[], theme: DiagramTheme) {
    const insertedBoxes: typeof blocks = [];
    blocks.forEach(box => {
      const currentBox: Graph = {
        center: {
          ...box.center
        },
        nodes: box.nodes,
        height: box.height,
        width: box.width
      };
      for (const b of insertedBoxes) {
        const minimumXDistance =
          currentBox.width / 2.0 + b.width / 2.0 + theme.graph.spacing.x * 2.0;
        const xVector = b.center.x - box.center.x;
        const xDistance = Math.abs(xVector);
        const minimumYDistance =
          currentBox.height / 2.0 +
          b.height / 2.0 +
          theme.graph.spacing.y * 2.0;
        const yVector = b.center.y - box.center.y;
        const yDistance = Math.abs(yVector);
        const x_overlap = minimumXDistance - xDistance;
        const y_overlap = minimumYDistance - yDistance;
        if (x_overlap > 0 && y_overlap > 0) {
          if (x_overlap < y_overlap) {
            currentBox.center.x += -1 * Math.sign(xVector) * x_overlap;
          } else {
            currentBox.center.y += -1 * Math.sign(yVector) * y_overlap;
          }
        }
      }
      insertedBoxes.push(currentBox);
    });
    insertedBoxes.forEach((ib, i) => {
      console.log(ib);
      const newCenter = {
        x: ib.center.x,
        y: ib.center.y
      };
      const block = blocks[i];
      block.nodes.forEach(node => {
        const relativePosition = {
          x: node.x - block.center.x,
          y: node.y - block.center.y
        };
        (node.x = newCenter.x + relativePosition.x),
          (node.y = newCenter.y + relativePosition.y);
      });
      block.center = {
        ...newCenter
      };
    });
  }
}
