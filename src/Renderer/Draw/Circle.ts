export const Circle = (
    context: CanvasRenderingContext2D,
    {
      x,
      y,
      radius,
      color,
      stroke
    }: {
      x: number;
      y: number;
      radius: number;
      color?: string;
      stroke: string;
    }
  ) => {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    if (color) {
      context.fillStyle = color;
      context.fill();
    }
    context.lineWidth = 2;
    context.strokeStyle = stroke;
    context.stroke();
  };
  