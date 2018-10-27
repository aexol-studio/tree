import { LinkWidgetProps } from '../types';
import { QuadraticPath } from './draw/QuadraticPath';
import * as vars from '../vars';
export class Link {
  static render(ctx: CanvasRenderingContext2D, l: LinkWidgetProps) {
    QuadraticPath(
      ctx,
      l.start.x,
      l.start.y,
      l.end.x,
      l.end.y,
      5,
      l.required ? 4 : 2,
      l.selected ? vars.selected : vars.lines
    );
  }
}
