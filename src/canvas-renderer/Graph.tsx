import { GraphState } from '../types';
import { Node } from './Node';
import { Link } from './Link';
import { ZoomPanManager } from '../ZoomPan';

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
  render(
    state: Pick<GraphState, 'nodes'> & {
      links: {
        start: {
          x: number;
          y: number;
        };
        end: {
          x: number;
          y: number;
        };
      }[];
    },
    zoompan: ZoomPanManager,
    NODE = {
      width: 150,
      height: 70,
      port: 6
    }
  ) {
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
    for (const { start, end } of links) {
      Link.render(this.ctx, {
        start: {
          x: start.x + NODE.port,
          y: start.y + NODE.height / 2.0
        },
        end: {
          x: end.x - NODE.port,
          y: end.y + NODE.height / 2.0
        }
      });
    }
  }
}
