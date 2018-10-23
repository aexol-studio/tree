import { LinkWidgetProps } from '../types';
import { QuadraticPath } from './draw/QuadraticPath';
export class Link {
  static render(ctx: CanvasRenderingContext2D, l: LinkWidgetProps) {
    QuadraticPath(ctx, l.start.x, l.start.y, l.end.x, l.end.y, 5);
  }
}
