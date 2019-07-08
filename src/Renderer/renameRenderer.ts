import { DiagramTheme } from "../Models";
import { ScreenPosition } from "../IO/ScreenPosition";
import { CSSMiniEngine } from "./CssMiniEngine";
import { EventBus } from "../EventBus";
import { DiagramEvents } from "../Events/index";

export class RenameRenderer {
  private textHandler?: HTMLInputElement;
  private renaming: boolean = false;
  private className = "Renamer";
  private _position: ScreenPosition = { x: 0, y: 0 };
  private _scale: number = 1.0;
  constructor(
    private context: CanvasRenderingContext2D,
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
        alignItems: "center",
        justifyContent: "center",
        transformOrigin: `top left`,
        zIndex: "1000",
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
        this.textHandler.style.display = "flex";
        this.textHandler.style.fontSize = `${this.theme.node.options.fontSize /
          1.5}px`;
        this.textHandler.style.width = `${this.theme.node.width / 2.0}px`;
        this.textHandler.style.height = `${this.theme.node.height / 2.0}px`;
        this.position(position, this._scale);
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
  position = (e: ScreenPosition, scale: number) => {
    this._position = e;
    this._scale = scale;
    this.calculatePosition();
  };
  calculatePosition = () => {
    if (this.textHandler) {
      this.textHandler.style.left = `${this.context.canvas.offsetLeft +
        this._position.x / 2.0}px`;
      this.textHandler.style.top = `${this.context.canvas.offsetTop +
        this._position.y / 2.0}px`;
      this.textHandler.style.transform = `scale(${this._scale})`;
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
