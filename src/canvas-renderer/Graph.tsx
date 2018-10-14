import { GraphState, NodeType } from '../types';
import { Node } from './Node';
import { Link } from './Link';
export class GraphCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  containerElement?: HTMLDivElement;
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.left = '0px';
    this.canvas.style.top = '0px';
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
  render(state: GraphState) {
    const { nodes, links } = state;
    for (const node of nodes) {
      Node.render(this.ctx, node);
    }
    const nodeMap: { [x: string]: NodeType } = nodes.reduce((a, b) => {
      a[b.id] = b;
      return a;
    }, {});
    for (const link of links) {
      Link.render(this.ctx, {
        start: {
          x: nodeMap[link.from.nodeId].x,
          y: nodeMap[link.from.nodeId].y
        },
        end: {
          x: nodeMap[link.to.nodeId].x,
          y: nodeMap[link.to.nodeId].y
        }
      });
    }
  }
}
