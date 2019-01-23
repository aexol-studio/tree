export const MultilineText = (
  context: CanvasRenderingContext2D,
  {
    x,
    y,
    lineHeight,
    width,
    text
  }: {
    x: number;
    y: number;
    lineHeight: number;
    text: string;
    width: number;
  }
) => {
  const words = text.split(" ");
  const wordMeasure = words.map(w => context.measureText(w)).map(w => w.width);
  const spaceSize = context.measureText(" ").width;
  let currentWidth = 0;
  let currentString = "";
  const lines = [];
  let index = 0;
  for (const wordWidth of wordMeasure) {
    const newWidth = currentWidth + wordWidth + spaceSize;
    if (newWidth > width) {
      lines.push(currentString);
      currentWidth = 0;
      currentString = "";
    }
    currentWidth += wordWidth + spaceSize;
    currentString += words[index] + " ";
    index++;
  }
  if (currentString) {
    lines.push(currentString);
  }
  for (var i = 0; i < lines.length; i++)
    context.fillText(lines[i], x, y + i * lineHeight);
  return lines;
};
