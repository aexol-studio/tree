export const RoundedRectangle = (
  context: CanvasRenderingContext2D,
  {
    width,
    height,
    x,
    y,
    radius,
    radiusTopLeft,
    radiusTopRight,
    radiusBottomRight,
    radiusBottomLeft
  }: {
    width: number;
    height: number;
    x: number;
    y: number;
    radius?: number;
    radiusTopLeft?: number;
    radiusTopRight?: number;
    radiusBottomRight?: number;
    radiusBottomLeft?: number;
  }
) => {
  let r = radius || 0;
  const rtl = radiusTopLeft || r;
  const rtr = radiusTopRight || r;
  const rbr = radiusBottomRight || r;
  const rbl = radiusBottomLeft || r;
  context.beginPath();
  context.moveTo(x + rtl, y);
  context.lineTo(x + width - rtr, y);
  context.arcTo(x + width, y, x + width, y + rtr, rtr);
  context.lineTo(x + width, y + height - rbr);
  context.arcTo(x + width, y + height, x + width - rbr, y + height, rbr);
  context.lineTo(x + rbl, y + height);
  context.arcTo(x, y + height, x, y + height - rbl, rbl);
  context.lineTo(x, y + rtl);
  context.arcTo(x, y, x + rtl, y, rtl);
  context.fill();
};
