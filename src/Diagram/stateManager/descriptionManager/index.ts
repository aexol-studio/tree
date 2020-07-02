import { DiagramState, Node, DiagramTheme } from "@models";
import { EventBus } from "@eventBus";
import { DiagramEvents, IOEvents } from "@events";
import { HtmlManager, HtmlElementRegistration } from "../htmlManager";
import { CSSMiniEngine } from "@renderer/CssMiniEngine";
import { Utils } from "@utils";
import { ConfigurationManager } from "@configuration";

const CSS_PREFIX = Utils.getUniquePrefix("DescriptionManager");

const containerClass = {
  position: "fixed",
  transformOrigin: "top left",
};

const descriptionClass = (theme: DiagramTheme) => ({
  borderRadius: "3px",
  padding: "10px",
  background: theme.colors.description.background,
  color: theme.colors.description.text,
  width: `${theme.description.width}px`,
  textAlign: "left",
  outline: "none",
  font: `normal ${theme.description.fontSize}px ${theme.fontFamily}`,
  lineHeight: `${theme.description.lineHeight}px`,
});

const descriptionSpanClass = (theme: DiagramTheme) => ({
  minWidth: "10px",
  minHeight: "14px",
  display: "block",
  outline: "none",
});

const descriptionSeparatorClass = {
  height: "10px",
  pointerEvents: "none",
  position: "relative",
};

const descriptionSeparatorClassAfter = (theme: DiagramTheme) => ({
  left: "50%",
  width: "10px",
  height: "10px",
  position: "absolute",
  transform: "translate(-5px, -5px) rotate(45deg)",
  background: theme.colors.description.background,
});

export class DescriptionManager {
  static containerClassName = `${CSS_PREFIX}Container`;
  static descriptionClassName = `${CSS_PREFIX}Description`;
  static descriptionSpanClassName = `${CSS_PREFIX}DescriptionSpan`;
  static separatorClassName = `${CSS_PREFIX}Separator`;

  DESCRIPTION_PLACEHOLDER: string | undefined;
  registeredDescriptionElement: HtmlElementRegistration | null = null;
  selectedNode: Node | null = null;
  editedValue = "";

  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    private htmlManager: HtmlManager
  ) {
    this.state;
    this.DESCRIPTION_PLACEHOLDER = ConfigurationManager.instance.getOption(
      "theme"
    ).description.placeholder;
    this.eventBus.subscribe(
      DiagramEvents.NodeSelected,
      this.nodeSelectionChange
    );
    this.eventBus.subscribe(
      DiagramEvents.NodeCreated,
      this.nodeSelectionChange
    );

    const {
      containerClassName,
      descriptionClassName,
      separatorClassName,
      descriptionSpanClassName,
    } = DescriptionManager;

    this.eventBus.subscribe(IOEvents.WorldMouseDrag, this.nodeMoving);
    this.eventBus.subscribe(DiagramEvents.NodeMoved, this.nodeMoved);

    CSSMiniEngine.instance.addClass(containerClass, containerClassName);
    CSSMiniEngine.instance.addClass(descriptionClass, descriptionClassName);
    CSSMiniEngine.instance.addClass(
      descriptionSpanClass,
      descriptionSpanClassName
    );
    CSSMiniEngine.instance.addClass(
      descriptionSeparatorClass,
      separatorClassName
    );
    CSSMiniEngine.instance.addClass(
      descriptionSeparatorClassAfter,
      separatorClassName,
      "::after"
    );
  }

  nodeMoving = () => {
    if (this.selectedNode && this.registeredDescriptionElement) {
      if (this.state.selectedNodes.indexOf(this.selectedNode) > -1) {
        this.registeredDescriptionElement.refs.container.style.pointerEvents =
          "none";
      }
    }
  };

  nodeMoved = () => {
    if (this.selectedNode && this.registeredDescriptionElement) {
      this.registeredDescriptionElement.refs.container.style.pointerEvents =
        "all";
    }
  };

  assignDescriptionToNode = () => {
    if (this.registeredDescriptionElement) {
      const descriptionObjectContent = this.editedValue;
      if (
        this.selectedNode &&
        descriptionObjectContent !== this.DESCRIPTION_PLACEHOLDER
      ) {
        this.selectedNode.description = descriptionObjectContent;
        this.eventBus.publish(DiagramEvents.NodeChanged);
      }
    }
  };
  clearDescription = () => {
    if (this.registeredDescriptionElement) {
      this.registeredDescriptionElement.remove();
    }
  };

  getNodeDescriptionValue = (node: Node) => {
    return node.description || this.DESCRIPTION_PLACEHOLDER;
  };

  nodeSelectionChange = () => {
    this.assignDescriptionToNode();
    this.clearDescription();
    if (
      this.state.selectedNodes.length === 0 ||
      this.state.selectedNodes.length > 1
    ) {
      return;
    }

    const node = this.state.selectedNodes[0];
    const isReadonly =
      this.state.isReadOnly || node.readonly || node.notEditable;

    if (isReadonly && !node.description) {
      this.clearDescription();
      return;
    }

    this.registerNodeEditedDescription(node);
  };

  registerNodeEditedDescription = (node: Node) => {
    const {
      containerClassName,
      descriptionClassName,
      separatorClassName,
      descriptionSpanClassName,
    } = DescriptionManager;

    const isReadonly =
      this.state.isReadOnly || node.readonly || node.notEditable;
    const { x, y } = node;
    const isContentEditable = isReadonly ? "" : "contenteditable";
    const elementRegistration = this.htmlManager.createElementFromHTML(
      `
      <div class="${containerClassName}" data-ref="container">
        <div class="${descriptionClassName}">
          <span data-ref="span" ${isContentEditable} class="${descriptionSpanClassName}"></span>
        </div>
        <div class="${separatorClassName}"></div>
      </div>
    `,
      x,
      y,
      false,
      "topCenter",
      node
    );

    const { refs } = elementRegistration;
    refs.span.innerText = this.getNodeDescriptionValue(node) || "";
    this.editedValue = refs.span.innerText;
    refs.span.addEventListener("paste", (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertHTML", false, text);
      }
    });
    refs.span.addEventListener("input", (e: any) => {
      this.editedValue = e.target.innerText;
    });

    refs.span.addEventListener("blur", () => {
      this.assignDescriptionToNode();
    });

    refs.span.addEventListener("focus", () => {
      if (!node.description) {
        const range = document.createRange();
        range.selectNodeContents(refs.span);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    });
    this.clearDescription();

    this.selectedNode = node;
    this.registeredDescriptionElement = elementRegistration;
    this.eventBus.publish(DiagramEvents.RenderRequested);
  };
}
