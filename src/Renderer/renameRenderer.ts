import { DiagramTheme } from "../Models";
import { ScreenPosition } from "../IO/ScreenPosition";
import { CSSMiniEngine } from "./CssMiniEngine";
import { EventBus } from "../EventBus";
import { DiagramEvents } from "../Events/index";

export class RenameRenderer {
  private textHandler?: HTMLInputElement;
  private renaming: boolean = false;
  private className = "Renamer";
  constructor(
    initialValue: string = "",
    private theme: DiagramTheme,
    private eventBus: EventBus,
    private cssMiniEngine: CSSMiniEngine
  ) {
    this.eventBus.subscribe(DiagramEvents.NodeRenameFocus, this.focus);
    this.eventBus.subscribe(DiagramEvents.NodeRenameShowInput, this.rename);
    this.eventBus.subscribe(DiagramEvents.NodeRenameEnded, this.hide);
    this.cssMiniEngine.addClass(
      {
        visibility: "visible",
        position: "fixed",
        background: "transparent",
        color: this.theme.colors.node.name,
        border: "0",
        textAlign: "center",
        display: "none",
        zIndex: "1000",
        padding: `20px 0`,
        marginTop: "-20px",
        outline: "none"
      },
      this.className
    );
  }
  createInput = () => {
    const className = "Renamer";
    const textHandler = document.createElement("input");
    textHandler.id = `inputss` + Math.random();
    textHandler.classList.add(className);
    document.body.appendChild(textHandler);
    this.textHandler = textHandler;
  };
  renameEnded = () => {
    if (this.renaming) {
      this.renaming = false;
      this.eventBus.publish(
        DiagramEvents.NodeRenameEnded,
        this.textHandler!.value
      );
    }
  };
  rename = (initialValue: string = "", position: ScreenPosition) => {
    if (!this.renaming) {
      this.createInput();
      if (this.textHandler) {
        this.renaming = true;
        this.textHandler.value = initialValue;
        this.textHandler.style.display = "block";
        this.textHandler.style.top = `${(position.y +
          this.theme.node.height / 2.0) /
          2.0 -
          this.theme.node.options.fontSize / 2.4}px`;
        this.textHandler.style.fontSize = `${this.theme.node.options.fontSize /
          1.6}px`;
        this.textHandler.style.left = `${position.x / 2}px`;
        this.textHandler.style.width = `${this.theme.node.width / 2.0}px`;
        setTimeout(() => this.textHandler!.focus(), 10);
        this.textHandler.onblur = e => {
          this.renameEnded();
        };
        this.textHandler.onkeyup = e => {
          if (e.key === "Enter") {
            this.renameEnded();
          }
        };
        this.textHandler.oncancel = e => {
          this.renameEnded();
        };
      }
    }
  };
  hide = () => {
    if (this.textHandler) {
      this.textHandler.style.display = "none";
      this.textHandler.remove();
    }
  };
  focus = () => {
    if (this.textHandler) {
      this.renaming = true;
      this.textHandler.focus();
    }
  };
}
