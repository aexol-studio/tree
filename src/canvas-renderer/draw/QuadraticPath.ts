export const QuadraticPath = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cornerRadius: number
): void => {
  let centerX = (x1 + x2) / 2.0;
  let ydiff = Math.abs(y2 - y1);
  let cr = ydiff > cornerRadius ? cornerRadius : ydiff;
  let crx = x2 > x1 ? cr : -cr;
  let cry = y2 > y1 ? cr : -cr;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(centerX - crx, y1);
  context.arcTo(centerX, y1, centerX, y1 + cry, cornerRadius);
  context.lineTo(centerX, y2 - cry);
  context.arcTo(centerX, y2, centerX + crx, y2, cornerRadius);
  context.lineTo(x2, y2);
  context.strokeStyle = '#fff';
  context.stroke();
};
