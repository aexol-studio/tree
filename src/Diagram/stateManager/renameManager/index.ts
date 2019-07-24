import { DiagramState, Node, DiagramTheme } from "../../../Models/index";
import { EventBus } from "../../../EventBus/index";
import { DiagramEvents, IOEvents } from "../../../Events/index";
import { HtmlManager, HtmlElementRegistration } from "../htmlManager/index";
import { CSSMiniEngine } from "../../../Renderer/CssMiniEngine/index";
import { Utils } from "../../../Utils/index";

const CSS_PREFIX = Utils.getUniquePrefix('RenameManager');

const containerClass = (theme: DiagramTheme) => ({
  position: 'fixed',
  transformOrigin: 'top left',
  width: `${theme.node.width / 2.0}px`,
  height: `${theme.node.height / 2.0}px`,
  fontSize: `${theme.node.nameSize / 2.0}px`,
  background: 'transparent',
  color: theme.colors.node.name,
  textAlign: 'center',
  border: '0',
  outline: '0',
});
/*
const descriptionClass = (theme: DiagramTheme) => ({
  borderRadius: '3px',
  padding: '10px',
  background: theme.colors.description.background,
  color: theme.colors.description.text,
  width: `${theme.description.width}px`,
  textAlign: 'center',
  outline: 'none',
  font: 'normal 12px Helvetica',
});

const descriptionSeparatorClass = {
  height: '10px',
  pointerEvents: 'none',
  position: 'relative',
};

const descriptionSeparatorClassAfter = (theme: DiagramTheme) => ({
  left: '50%',
  top: '-5px',
  width: '10px',
  height: '10px',
  position: 'absolute',
  transform: 'rotate(45deg)',
  background: theme.colors.description.background,
});*/

export class RenameManager {
  static containerClassName = `${CSS_PREFIX}Container`;
  // static descriptionClassName = `${CSS_PREFIX}Description`;
  // static separatorClassName = `${CSS_PREFIX}Separator`;
  registeredRenameElement: HtmlElementRegistration | null = null;
  renamedNode: Node | null = null;

  constructor(private state: DiagramState, private eventBus: EventBus, private htmlManager: HtmlManager, /*, private htmlManager: HtmlManager*/) {
    this.state;
    this.htmlManager;
    // this.eventBus.subscribe(
    //   DiagramEvents.NodeSelected,
    //   this.nodeSelectionChange
    // );

    // const {
    //   containerClassName,
    //   descriptionClassName,
    //   separatorClassName,
    // } = DescriptionManager;

    this.eventBus.subscribe(IOEvents.WorldMouseDrag, this.nodeMoving);
    this.eventBus.subscribe(DiagramEvents.NodeMoved, this.nodeMoved);

    CSSMiniEngine.instance.addClass(containerClass, RenameManager.containerClassName);
    // CSSMiniEngine.instance.addClass(descriptionClass, descriptionClassName);
    // CSSMiniEngine.instance.addClass(descriptionSeparatorClass, separatorClassName);
    // CSSMiniEngine.instance.addClass(descriptionSeparatorClassAfter, separatorClassName, '::after');
  }

  nodeMoving = () => {
    if (this.renamedNode && this.registeredRenameElement) {
      if (this.state.selectedNodes.indexOf(this.renamedNode) > -1) {
        this.registeredRenameElement.refs.input.style.pointerEvents = 'none';
      }
    }
  };

  nodeMoved = () => {
    if (this.renamedNode && this.registeredRenameElement) {
      this.registeredRenameElement.refs.input.style.pointerEvents = 'all';
    }
  };

  startRenaming(node: Node) {
    this.renamedNode = node;
    this.clearRenameInputs();

    const { x, y } = node;

    const elementRegistration = this.htmlManager.createElementFromHTML(`
      <input class="${RenameManager.containerClassName}" data-ref="input" value="${node.name}"/>
    `,
      x,
      y,
      true,
      {x: 0, y: -1},
      node,
    );

    const { refs } = elementRegistration;

    window.requestAnimationFrame(() => {
      // refs.input.focus();
      (refs.input as HTMLInputElement).select();
    });

    refs.input.addEventListener('blur', () => {
      this.eventBus.publish(
        DiagramEvents.NodeRenameEnded,
        (refs.input as HTMLInputElement).value,
      );
      this.clearRenameInputs();
    });

    this.registeredRenameElement = elementRegistration;
    this.eventBus.publish(DiagramEvents.RenderRequested);
  }

  clearRenameInputs = () => {
    if (this.registeredRenameElement) {
      this.registeredRenameElement.remove();
    }
  };

  getNodeDescriptionValue = (node: Node) => {
    // return node.description || 'Put your description here';
  };

  nodeSelectionChange = () => {
    if (this.state.selectedNodes.length === 0 || this.state.selectedNodes.length > 1) {
      this.clearRenameInputs();
      return;
    }

    this.startRenaming(this.state.selectedNodes[0]);
  }

  registerNodeEditedDescription = (node: Node) => {
    // const {
    //   containerClassName,
    //   descriptionClassName,
    //   separatorClassName,
    // } = DescriptionManager;

    // this.clearDescription();
    // const { x, y } = node;
    // const elementRegistration = this.htmlManager.createElementFromHTML(`
    //   <div class="${containerClassName}" data-ref="container">
    //     <div class="${descriptionClassName}">
    //       <span data-ref="span" contenteditable>${this.getNodeDescriptionValue(node)}</span>
    //     </div>
    //     <div class="${separatorClassName}"></div>
    //   </div>
    // `,
    //   x,
    //   y,
    //   false,
    //   'topCenter',
    //   node,
    // );

    // const { refs } = elementRegistration;

    // refs.span.addEventListener('blur', () => {
    //   node.description = (refs.span as HTMLSpanElement).innerHTML;
    // });

    // this.selectedNode = node;
    // this.registeredDescriptionElement = elementRegistration;
    // // this.eventBus.publish(DiagramEvents.RenderRequested);
  };
}
