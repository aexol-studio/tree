import { GraphState, LinkWidgetProps, NodeType } from '../types';
import { Node } from './Node';
import { Link } from './Link';
import { ZoomPanManager } from '../ZoomPan';
import * as vars from '../vars';
import { getNodeWidth } from '../viewport';
import * as throttle from 'lodash/throttle';

export class GraphCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  containerElement?: HTMLDivElement;
  renamed: number;
  resizeSubscribers: Array<() => void> = [];
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.left = '0px';
    this.canvas.style.top = '0px';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.ctx.font = '10px Helvetica';
    this.clearCanvas();

    window.addEventListener('resize', throttle(this.afterResize, 100));
  }
  onResize(callback: () => void) {
    this.resizeSubscribers.push(callback);
    return () => {
      this.resizeSubscribers = this.resizeSubscribers.filter(listener => listener !== callback);
    };
  }
  registerContainerElement(containerElement: HTMLDivElement) {
    this.containerElement = containerElement;
    this.containerElement.appendChild(this.canvas);
  }
  afterResize = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.resizeSubscribers.forEach(listener => listener());
  };
  transform = (zoomPan: ZoomPanManager) => {
    const { x, y } = zoomPan.getPosition();
    const scale = zoomPan.getScale();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.translate(x, y);
    this.ctx.scale(scale, scale);
  };
  clearCaret = () => {
    clearInterval(this.renamed);
  };
  caret = (
    n: NodeType,
    NODE = {
      width: 150,
      height: 70,
      port: 6
    }
  ) => {
    clearInterval(this.renamed);
    const drawCaret = (toggle: boolean) => {
      window.requestAnimationFrame(() => {
        const { x, y, name } = n;
        let width = getNodeWidth(n);
        const textWidth = this.ctx.measureText(name).width;
        this.ctx.fillStyle = toggle ? vars.lines : vars.selected;
        this.ctx.fillRect(x + width / 2.0 + textWidth / 2.0 + 4, y + NODE.height / 2.0 - 16, 2, 12);
        clearInterval(this.renamed);
        this.renamed = setInterval(() => {
          drawCaret(!toggle);
        }, 500);
      });
    };
    drawCaret(true);
  };
  clearCanvas = () => {
    window.requestAnimationFrame(() => {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = vars.bgradial;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    });
  };
  render(
    state: Pick<GraphState, 'nodes'> & {
      links: LinkWidgetProps[];
    },
    zoompan: ZoomPanManager,
    NODE = {
      width: 150,
      height: 70,
      port: 6
    }
  ) {
    window.requestAnimationFrame(() => {
      const { nodes, links } = state;
      const { x, y } = zoompan.getPosition();
      const scale = zoompan.getScale();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = vars.bgradial;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.translate(x, y);
      this.ctx.scale(scale, scale);
      for (const { start, end, required, selected } of links) {
        Link.render(this.ctx, {
          start: {
            x: start.x + NODE.port,
            y: start.y + NODE.height / 2.0
          },
          end: {
            x: end.x - NODE.port,
            y: end.y + NODE.height / 2.0
          },
          required,
          selected
        });
      }
      for (const node of nodes) {
        Node.render(this.ctx, node, NODE);
      }
    });
  }
}
