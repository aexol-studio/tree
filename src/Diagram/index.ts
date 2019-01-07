import { Renderer } from "../Renderer";
import { EventBus } from "../EventBus";
import { StateManager } from "./stateManager";
import { IO } from "../IO";
import { DiagramTheme } from "../Models";
import { DefaultDiagramTheme } from "../Theme/DefaultDiagramTheme";

/**
 * Diagram:
 *
 * Main class. Responsibilities:
 * - instantiating the diagram in the DOM element given by constructor
 * - initializing all of the subcomponents: renderer, IO, state manager etc.
 */
export class Diagram {
  private renderer: Renderer;
  private eventBus: EventBus;
  private stateManager: StateManager;

  setCategories(categories: any[]) {
    this.stateManager.setCategories(categories);
    // ... update the data
  }

  calculateElementSize(domElement: HTMLElement) {
    return { width: domElement.clientWidth, height: domElement.clientHeight };
  }

  constructor(
    domElement: HTMLElement,
    theme: DiagramTheme = DefaultDiagramTheme
  ) {
    if (typeof document === "undefined") {
      throw new Error(
        "Diagram can work only in DOM-enabled environment (e.g. browser)!"
      );
    }

    const canvasElement = document.createElement("canvas");
    const canvasContext = canvasElement.getContext("2d");
    canvasContext!.font = "10px Helvetica";

    const hostSize = this.calculateElementSize(domElement);

    canvasElement.width = hostSize.width * 2;
    canvasElement.height = hostSize.height * 2;

    canvasElement.style.width = `${hostSize.width}px`;
    canvasElement.style.height = `${hostSize.height}px`;

    while (domElement.firstChild) {
      domElement.removeChild(domElement.firstChild);
    }

    domElement.appendChild(canvasElement);

    if (!canvasContext) {
      throw new Error("Can't create canvas context!");
    }

    // create a main event bus
    this.eventBus = new EventBus();

    // initialize IO: mouse/keyboard logic will be there
    new IO(this.eventBus, canvasElement);

    // initialize state manager
    this.stateManager = new StateManager(this.eventBus, theme);

    // initialize renderer
    this.renderer = new Renderer(
      this.eventBus,
      canvasContext,
      this.stateManager,
      theme
    );

    // ...start the rendering loop
    this.renderer.renderStart();
  }
}
