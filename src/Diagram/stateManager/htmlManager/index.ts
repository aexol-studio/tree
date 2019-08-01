import { DiagramState, Node, DiagramTheme } from "../../../Models/index";
import { EventBus } from "../../../EventBus/index";
import * as Events from "../../../Events/index";
import { CSSMiniEngine } from "../../../Renderer/CssMiniEngine/index";
import { Utils } from "../../../Utils/index";

export type DiagramHtmlElementPaddedBy = { x: number; y: number } | "topCenter";

const CSS_PREFIX = Utils.getUniquePrefix("HtmlManager");

export interface DiagramHtmlElement {
  id: number;
  x: number;
  y: number;
  element: HTMLElement;
  node?: Node;
  paddedBy: DiagramHtmlElementPaddedBy;
  scalable: boolean;
}

export type HtmlElementRegistration = {
  remove: () => void;
  refs: {
    [k: string]: HTMLElement;
  };
};

const helpContainerClass = (theme: DiagramTheme) => ({
  position: "absolute",
  left: "10px",
  top: "10px",
  right: `${theme.minimap.size / 2.0 + 20}px`,
  height: "auto",
  pointerEvents: "none",
  display: "none",
  padding: `${theme.help.padding}px`,
  background: theme.colors.help.background
});

const helpTitleClass = (theme: DiagramTheme) => ({
  fontSize: `${theme.help.title.text}px`,
  color: theme.colors.help.title,
  marginBottom: "10px"
});

const helpContentClass = (theme: DiagramTheme) => ({
  fontSize: `${theme.help.text}px`,
  color: theme.colors.help.text,
  lineHeight: `${theme.help.lineHeight}px`
});

function createElementFromHTML(htmlString: string) {
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstChild as HTMLElement;
}

export class HtmlManager {
  elements: DiagramHtmlElement[];
  nodeAttachedElements: DiagramHtmlElement[];
  helpElements?: [HTMLDivElement, HTMLDivElement, HTMLDivElement];
  created: boolean = false;
  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    private getHostElement: () => HTMLElement,
    private theme: DiagramTheme
  ) {
    this.elements = [];
    this.nodeAttachedElements = [];
    this.state;
    this.eventBus.subscribe(
      Events.DiagramEvents.RenderRequested,
      this.renderRequested
    );
    this.eventBus.subscribe(Events.IOEvents.WorldMouseDrag, this.nodeMoved);

    CSSMiniEngine.instance.addClass(
      helpContainerClass,
      `${CSS_PREFIX}container`
    );
    CSSMiniEngine.instance.addClass(helpTitleClass, `${CSS_PREFIX}title`);
    CSSMiniEngine.instance.addClass(helpContentClass, `${CSS_PREFIX}content`);

    this.prepareHelpMarkup();
  }
  prepareHelpMarkup = () => {
    const divHelpTitle = document.createElement("div");
    const divHelpContent = document.createElement("div");
    const divHelp = document.createElement("div");
    this.getHostElement().appendChild(divHelp);
    divHelp.className = `${CSS_PREFIX}container`;
    divHelpTitle.className = `${CSS_PREFIX}title`;
    divHelpContent.className = `${CSS_PREFIX}content`;
    divHelp.appendChild(divHelpTitle);
    divHelp.appendChild(divHelpContent);
    this.helpElements = [divHelp, divHelpTitle, divHelpContent];
  };
  renderHelp = (help: { title: string; text: string }) => {
    if (!this.helpElements) {
      return;
    }
    const [divHelp, divHelpTitle, divHelpContent] = this.helpElements;
    divHelp.style.display = "block";
    divHelpTitle.innerText = help.title;
    divHelpContent.innerText = help.text;
  };
  hideHelp = () => {
    if (!this.helpElements) {
      return;
    }
    const [divHelp] = this.helpElements;
    divHelp.style.display = "none";
  };
  renderRequested = () => {
    this.elements.forEach(e => {
      const { scale } = this.state.uiState;
      const x = (this.state.uiState.panX! + e.x) / 2.0;
      const y = (this.state.uiState.panY! + e.y) / 2.0;
      const nodeWidth = this.theme.node.width;
      if (e.scalable) {
        if (e.paddedBy === "topCenter") {
          e.element.style.transform = `scale(${scale}) translate(calc(-50% + ${nodeWidth /
            4}px), -100%) translate(${x}px, ${y}px)`;
        } else {
          e.element.style.transform = `scale(${scale}) translate(${x +
            e.paddedBy.x}px, ${y + e.paddedBy.y}px)`;
        }
      } else {
        if (e.paddedBy === "topCenter") {
          e.element.style.transform = `translate(-50%, -100%) scale(${scale}) translate(${nodeWidth *
            0.25}px, 0) translate(${x}px, ${y}px) scale(${1 / scale})`;
        } else {
          e.element.style.transform = `scale(${scale}) translate(${x +
            e.paddedBy.x}px, ${y + e.paddedBy.y}px) scale(${1 / scale})`;
        }
      }
    });
  };
  nodeMoved = () => {
    const node = this.state.selectedNodes[0];
    this.elements.forEach(e => {
      if (node && e.node === node) {
        e.x = node.x;
        e.y = node.y;
        this.eventBus.publish(Events.DiagramEvents.RenderRequested);
      }
    });
  };
  removeElement = (deletedElement: DiagramHtmlElement) => {
    deletedElement.element.remove();
    this.elements = this.elements.filter(e => e !== deletedElement);
    this.nodeAttachedElements = this.nodeAttachedElements.filter(
      e => e !== deletedElement
    );
  };
  createElementFromHTML(
    markup: string,
    x: number,
    y: number,
    scalable: boolean,
    paddedBy: DiagramHtmlElementPaddedBy,
    node?: Node
  ): HtmlElementRegistration {
    const element = createElementFromHTML(markup);
    const registeredEntity: DiagramHtmlElement = {
      x,
      y,
      element,
      id: 123,
      paddedBy,
      scalable
    };

    this.elements.push(registeredEntity);

    if (node) {
      registeredEntity.node = node;
      this.nodeAttachedElements.push(registeredEntity);
    }

    element.style.left = `${this.getHostElement().offsetLeft}px`;
    element.style.top = `${this.getHostElement().offsetTop}px`;
    this.getHostElement().appendChild(element);

    const referencesSet: { [k: string]: HTMLElement } = Array.from(
      element.querySelectorAll("[data-ref]")
    ).reduce((acc, currentElement) => {
      return {
        ...acc,
        [currentElement.getAttribute("data-ref")!]: currentElement
      };
    }, {});

    const refAttributeValue = element.getAttribute("data-ref");

    if (refAttributeValue) {
      referencesSet[refAttributeValue] = element;
    }

    return {
      remove: () => this.removeElement(registeredEntity),
      refs: referencesSet
    };
  }
}
