import { MiniMapNodesType } from '../types/MiniMap';
import * as vars from '../vars';
export class MiniMapNodes {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  containerElement?: HTMLDivElement;
  constructor(w: number, h: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.left = '0px';
    this.canvas.style.right = '0px';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx = this.canvas.getContext('2d');
  }
  registerContainerElement(containerElement: HTMLDivElement) {
    this.containerElement = containerElement;
    this.containerElement.appendChild(this.canvas);
  }
  render(props: MiniMapNodesType) {
    window.requestAnimationFrame(() => {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (const { x, y } of props.nodes) {
        this.ctx.fillStyle = vars.minimapElement;
        this.ctx.fillRect(x, y, 4, 2);
      }
    });
  }
}
