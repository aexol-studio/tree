import { DiagramState, Node, DiagramTheme } from "../../../Models/index";
import { EventBus } from "../../../EventBus/index";
import { DiagramEvents, IOEvents } from "../../../Events/index";
import { HtmlManager, HtmlElementRegistration } from "../htmlManager/index";
import { CSSMiniEngine } from "../../../Renderer/CssMiniEngine/index";
import { Utils } from "../../../Utils/index";

const CSS_PREFIX = Utils.getUniquePrefix("RenameManager");

const containerClass = (theme: DiagramTheme) => ({
  position: "fixed",
  transformOrigin: "top left",
  width: `${theme.node.width / 2.0}px`,
  height: `${theme.node.height / 2.0}px`,
  fontSize: `${theme.node.nameSize / 2.0}px`,
  background: "transparent",
  color: theme.colors.node.name,
  textAlign: "center",
  border: "0",
  outline: "0"
});

export class RenameManager {
  static containerClassName = `${CSS_PREFIX}Container`;

  registeredRenameElement: HtmlElementRegistration | null = null;

  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    private htmlManager: HtmlManager /*, private htmlManager: HtmlManager*/
  ) {
    this.state;
    this.htmlManager;

    this.eventBus.subscribe(IOEvents.ScreenDoubleClick, this.tryToRenameNode);
    this.eventBus.subscribe(IOEvents.WorldMouseDrag, this.nodeMoving);
    this.eventBus.subscribe(DiagramEvents.NodeMoved, this.nodeMoved);

    CSSMiniEngine.instance.addClass(
      containerClass,
      RenameManager.containerClassName
    );
  }

  nodeMoving = () => {
    if (this.state.renamed && this.registeredRenameElement) {
      if (this.state.selectedNodes.indexOf(this.state.renamed) > -1) {
        this.registeredRenameElement.refs.input.style.pointerEvents = "none";
      }
    }
  };

  nodeMoved = () => {
    if (this.state.renamed && this.registeredRenameElement) {
      this.registeredRenameElement.refs.input.style.pointerEvents = "all";
    }
  };

  preventCurrentEvent = () => {
    if (!window.event) {
      return;
    }
    window.event.preventDefault();
  };

  tryToRenameNode = () => {
    if (
      this.state.selectedNodes.length == 0 ||
      this.state.selectedNodes.length > 1
    ) {
      return;
    }
    const [node] = this.state.selectedNodes;
    if (!node || node.readonly || this.state.isReadOnly || node.notEditable) {
      this.preventCurrentEvent();
      return;
    }

    this.startRenaming(node);
  };

  startRenaming = (node: Node) => {
    this.state.renamed = node;
    this.clearRenameInputs();

    const { x, y } = node;

    const elementRegistration = this.htmlManager.createElementFromHTML(
      `
      <input class="${RenameManager.containerClassName}" data-ref="input" value="${node.name}"/>
    `,
      x,
      y,
      true,
      { x: 0, y: -1 },
      node
    );

    const { refs } = elementRegistration;

    window.requestAnimationFrame(() => {
      (refs.input as HTMLInputElement).select();
    });

    const saveNewName = () => {
      refs.input.removeEventListener("blur", saveNewName);
      this.finalizeRenaming((refs.input as HTMLInputElement).value);
    };

    refs.input.addEventListener("blur", saveNewName);

    refs.input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        saveNewName();
      }
      if (e.key === "Escape") {
        refs.input.removeEventListener("blur", saveNewName);
        this.cancelRenaming();
      }
    });

    this.registeredRenameElement = elementRegistration;
    this.eventBus.publish(DiagramEvents.RenderRequested);
  };

  clearRenameInputs = () => {
    if (this.registeredRenameElement) {
      this.registeredRenameElement.remove();
    }
  };

  cancelRenaming = () => {
    delete this.state.renamed;
    this.clearRenameInputs();
    this.eventBus.publish(DiagramEvents.RenderRequested);
  };

  finalizeRenaming = (newName: string) => {
    if (this.state.renamed) {
      const node = this.state.renamed;

      if (this.state.isReadOnly || node.notEditable || node.readonly) {
        return;
      }
      node.name = newName;
      if (node.editsDefinitions) {
        node.editsDefinitions.forEach(ed => (ed.type = newName));
      }
      this.eventBus.publish(DiagramEvents.NodeChanged);
      this.eventBus.publish(DiagramEvents.RenderRequested);
    }

    delete this.state.renamed;
    this.clearRenameInputs();
    this.eventBus.publish(DiagramEvents.RenderRequested);
  };

  nodeSelectionChange = () => {
    if (
      this.state.selectedNodes.length === 0 ||
      this.state.selectedNodes.length > 1
    ) {
      this.clearRenameInputs();
      return;
    }

    this.startRenaming(this.state.selectedNodes[0]);
  };
}
