import { RoundedRectangle } from "./RoundedRectangle";
import { Triangle } from "./Triangle";
export const Bubble = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  triangleWidth: number,
  triangleHeight: number
): void => {
  RoundedRectangle(context, {
    width,
    height,
    x: x - width / 2.0,
    y: y - height - triangleHeight,
    radius: 5
  });
  Triangle(
    context,
    x - triangleWidth / 2.0,
    y - triangleHeight,
    x + triangleWidth / 2.0,
    y - triangleHeight,
    x,
    y
  );
};
