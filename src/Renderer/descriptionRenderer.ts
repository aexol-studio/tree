import { DiagramTheme, Node } from "../Models";
import { CSSMiniEngine } from "./CssMiniEngine";
import { ScreenPosition } from "../IO/ScreenPosition";
import { EventBus } from "../EventBus/index";
import { DiagramEvents } from "../Events/index";
export class DescriptionRenderer {
  private className = "Description";
  private textarea?: HTMLDivElement;
  public visible: boolean = false;
  private node?: Node;
  private _position: ScreenPosition = { x: 0, y: 0 };
  constructor(
    private context: CanvasRenderingContext2D,
    private eventBus: EventBus,
    private theme: DiagramTheme,
    private cssMiniEngine: CSSMiniEngine
  ) {
    this.cssMiniEngine.addClass(
      {
        borderRadius: "3px",
        padding: "10px",
        background: this.theme.colors.description.background,
        color: this.theme.colors.description.text,
        width: `${this.theme.description.width / 2.0}px`,
        textAlign: "center",
        position: "fixed",
        outline: "none",
        zIndex: "1000",
        font: this.getNodeFont(10)
      },
      this.className
    );
    this.eventBus.subscribe(
      DiagramEvents.DescriptionRenameShowInput,
      this.createTextarea
    );
    this.eventBus.subscribe(DiagramEvents.DescriptionRenameEnded, this.hide);
  }
  createTextarea = (
    node: Node,
    initialValue: string = "",
    e: ScreenPosition
  ) => {
    if (!this.visible) {
      this.node = node;
      this._position = e;
      this.visible = true;
      this.textarea = document.createElement("div");
      this.textarea.classList.add(this.className);
      this.textarea.innerHTML = initialValue || "Put your description here";
      this.textarea.contentEditable = "true";
      this.position(e);
      this.textarea.onfocus = e => {
        if (this.textarea!.innerHTML === "Put your description here") {
          this.textarea!.innerHTML = "";
        }
      };
      this.textarea.oninput = e => {
        this.calculatePosition();
      };
      document.body.appendChild(this.textarea);
    }
  };
  position = (e: ScreenPosition) => {
    this._position = e;
    this.calculatePosition();
  };
  calculatePosition = () => {
    if (this.textarea) {
      this.textarea.style.left = `${(this._position.x -
        this.theme.node.width / 2.0) /
        2.0}px`;
      this.textarea.style.top = `${this._position.y / 2.0 -
        this.textarea.getBoundingClientRect().height -
        20}`;
    }
  };
  hide = () => {
    if (this.visible && this.textarea) {
      this.visible = false;
      this.node!.description = this.textarea.innerHTML;
      this.textarea.remove();
    }
  };
  focus = () => {
    if (this.textarea) {
      this.textarea.focus();
    }
  };
  getNodeFont(size: number, weight = "normal") {
    return `${weight} ${size}px ${
      this.context.font.split(" ")[this.context.font.split(" ").length - 1]
    }`;
  }
}
