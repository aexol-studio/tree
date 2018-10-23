import { NodeType } from './types';
import { ZoomPanManager } from './ZoomPan';

export const NodeDimensions = {
  width: 100,
  height: 52,
  port: 4,
  font: {
    size: 10
  }
};

export const getNodeWidth = (fn: NodeType) => {
  let newWidth =
    20 +
    8 *
      (fn.name.length > (fn.kind || fn.type).length ? fn.name.length : (fn.kind || fn.type).length);
  return newWidth > NodeDimensions.width ? newWidth : NodeDimensions.width;
};

export const nodesInViewPort = (nodes: NodeType[], zoomPan: ZoomPanManager): NodeType[] => {
  const { x, y } = zoomPan.getPosition();
  const scale = zoomPan.getScale();
  let { innerWidth: w, innerHeight: h } = window;
  const b = {
    min: {
      x: -x / scale - NodeDimensions.width,
      y: -y / scale - NodeDimensions.height
    },
    max: {
      x: w / scale - x / scale,
      y: h / scale - y / scale
    }
  };
  return nodes.filter((n) => n.x > b.min.x && n.x < b.max.x && n.y > b.min.y && n.y < b.max.y);
};

export const getNodesAroundTheCursor = (
  nodes: NodeType[],
  zoomPan: ZoomPanManager,
  cursorX,
  cursorY
): NodeType[] => {
  const { x, y } = zoomPan.getPosition();
  const scale = zoomPan.getScale();
  const xScale = cursorX / scale - x / scale;
  const yScale = cursorY / scale - y / scale;
  const nodesRet = nodes.filter(
    (n) => Math.abs(n.x - xScale) < 300*scale && Math.abs(n.y - yScale) < 300*scale
  );
  return nodesRet;
};
