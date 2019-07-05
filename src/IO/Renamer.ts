import { ScreenPosition } from "./ScreenPosition";
import { DiagramTheme } from "../Models/index";

export class Renamer {
  private textHandler: HTMLInputElement;
  constructor(initialValue: string = "", private theme: DiagramTheme) {
    const textHandler = document.createElement("input");
    textHandler.value = initialValue;
    textHandler.id = `inputss`;
    textHandler.autofocus = true;
    textHandler.style.visibility = "visible";
    textHandler.style.position = "fixed";
    textHandler.style.top = "0px";
    textHandler.style.backgroundColor = "transparent";
    textHandler.style.color = theme.colors.node.name;
    textHandler.style.border = "0";
    textHandler.style.textAlign = "center";
    textHandler.style.zIndex = "1000";
    document.body.appendChild(textHandler);
    this.textHandler = textHandler;
  }
  rename(
    initialValue: string = "",
    position: ScreenPosition,
    onChange: (e: string) => void
  ) {
    this.textHandler.value = initialValue;
    this.textHandler.style.top = `${(position.y +
      this.theme.node.height / 2.0) /
      2.0 -
      this.theme.node.options.fontSize / 2.4}px`;
    this.textHandler.style.fontSize = `${this.theme.node.options.fontSize /
      1.6}px`;
    this.textHandler.style.left = `${position.x / 2}px`;
    this.textHandler.style.width = `${this.theme.node.width / 2.0}px`;
    this.textHandler.oninput = e => {
      onChange((e.target! as HTMLInputElement).value);
    };
    setTimeout(() => this.textHandler.focus(), 10);
  }
}
