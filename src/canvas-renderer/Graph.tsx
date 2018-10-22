import { GraphState, NodeType } from '../types';
import { Node } from './Node';
import { Link } from './Link';
import { ZoomPanManager } from '../ZoomPan';

const NODE = {
  width: 150,
  height: 70,
  port: 6
};

export class GraphCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  containerElement?: HTMLDivElement;
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.left = '0px';
    this.canvas.style.top = '0px';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.ctx = this.canvas.getContext('2d');
    this.ctx.font = '10px Helvetica';
  }
  registerContainerElement(containerElement: HTMLDivElement) {
    this.containerElement = containerElement;
    this.containerElement.appendChild(this.canvas);
  }
  render(state: Pick<GraphState, 'nodes' | 'links'>, zoompan: ZoomPanManager) {
    const { nodes, links } = state;
    const { x, y } = zoompan.getPosition();
    const scale = zoompan.getScale();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(x, y);
    this.ctx.scale(scale, scale);
    for (const node of nodes) {
      Node.render(this.ctx, node, NODE);
    }
    const nodeMap: { [x: string]: NodeType } = nodes.reduce((a, b) => {
      a[b.id] = b;
      return a;
    }, {});
    for (const link of links) {
      Link.render(this.ctx, {
        start: {
          x: nodeMap[link.from.nodeId].x + NODE.width + NODE.port,
          y: nodeMap[link.from.nodeId].y + NODE.height / 2.0
        },
        end: {
          x: nodeMap[link.to.nodeId].x - NODE.port,
          y: nodeMap[link.to.nodeId].y + NODE.height / 2.0
        }
      });
    }
  }
}
