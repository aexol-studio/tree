import { DiagramTheme, Node } from "../Models";
import { CSSMiniEngine } from "./CssMiniEngine";
import { ScreenPosition } from "../IO/ScreenPosition";
import { EventBus } from "../EventBus/index";
import { DiagramEvents } from "../Events/index";
export class DescriptionRenderer {
  private className = "Description";
  private triangleClassName = "DescriptionTriangle";
  private textarea?: HTMLDivElement;
  private triangle?: HTMLDivElement;
  private node?: Node;
  private _position: ScreenPosition = { x: 0, y: 0 };
  private _scale: number = 1.0;
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
        width: `${this.theme.description.width}px`,
        textAlign: "center",
        position: "fixed",
        outline: "none",
        zIndex: "1000",
        transformOrigin: `top left`,
        font: this.getNodeFont(12)
      },
      this.className
    );
    this.cssMiniEngine.addClass(
      {
        width: `0px`,
        height: `0px`,
        position: "fixed",
        borderLeft: `${
          this.theme.description.triangleWidth
        }px solid transparent`,
        borderRight: `${
          this.theme.description.triangleWidth
        }px solid transparent`,
        borderTop: `${this.theme.description.triangleHeight}px solid ${
          this.theme.colors.description.background
        }`
      },
      this.triangleClassName
    );
    this.eventBus.subscribe(
      DiagramEvents.DescriptionRenameShowInput,
      this.createTextarea
    );
    this.eventBus.subscribe(
      DiagramEvents.DescriptionMakeEditable,
      this.makeEditable
    );
    this.eventBus.subscribe(
      DiagramEvents.DescriptionMakeReadOnly,
      this.makeReadOnly
    );
  }
  createTextarea = (node: Node, e: ScreenPosition) => {
    if (this.textarea) this.hide();
    this.node = node;
    this._position = e;
    this.textarea = document.createElement("div");
    this.textarea.classList.add(this.className);
    this.textarea.innerHTML = node.description || "Put your description here";
    this.triangle = document.createElement("div");
    this.triangle.classList.add(this.triangleClassName);
    this.position(e, this._scale);
    this.textarea.onfocus = e => {
      if (this.textarea!.innerHTML === "Put your description here") {
        this.textarea!.innerHTML = "";
      }
    };
    this.textarea.oninput = e => {
      this.calculatePosition();
    };
    document.body.appendChild(this.textarea);
    document.body.appendChild(this.triangle);
  };
  makeReadOnly = () => {
    if (this.textarea) {
      this.textarea.contentEditable = "false";
    }
  };
  makeEditable = () => {
    if (this.textarea) {
      this.textarea.contentEditable = "true";
    }
  };
  position = (e: ScreenPosition, scale: number) => {
    this._position = e;
    this._scale = scale;
    this.calculatePosition();
  };
  calculatePosition = () => {
    if (this.textarea && this.triangle) {
      const newPosition = {
        left:
          this.context.canvas.offsetLeft +
          this._position.x / 2.0 -
          (this._scale * this.theme.description.width) / 2.0 +
          (this._scale * this.theme.node.width) / 4.0,
        top:
          this.context.canvas.offsetTop +
          this._position.y / 2.0 -
          (this.textarea.getBoundingClientRect().height || 0) -
          this._scale * this.theme.description.triangleDistance
      };
      this.textarea.style.left = `${newPosition.left}px`;
      this.textarea.style.top = `${newPosition.top}px`;
      this.textarea.style.transform = `scale(${this._scale})`;
      this.triangle.style.left = `${newPosition.left +
        (this._scale * this.theme.description.width) / 2.0 -
        this.theme.description.triangleWidth}px`;
      this.triangle.style.top = `${newPosition.top +
        (this.textarea.getBoundingClientRect().height || 0)}px`;
    }
  };
  hide = () => {
    if (this.textarea && this.triangle) {
      if (this.textarea.innerHTML !== "Put your description here") {
        this.node!.description = this.textarea.innerHTML;
        this.eventBus.publish(DiagramEvents.DescriptionRenameEnded);
      }
      this.triangle.remove();
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
