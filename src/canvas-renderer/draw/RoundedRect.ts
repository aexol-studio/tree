export const RoundedRectangle = (
  context: CanvasRenderingContext2D,
  {
    width,
    height,
    x,
    y,
    radius
  }: {
    width: number;
    height: number;
    x: number;
    y: number;
    radius: number;
  }
) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.arcTo(x + width, y, x + width, y + radius, radius);
  context.lineTo(x + width, y + height - radius);
  context.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  context.lineTo(x + radius, y + height);
  context.arcTo(x, y + height, x, y + height - radius, radius);
  context.lineTo(x, y + radius);
  context.arcTo(x, y, x + radius, y, radius);
  context.fill();
};
