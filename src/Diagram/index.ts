import { Renderer } from "../Renderer";
import { EventBus } from "../EventBus";
import { IO } from "../IO";
import { DiagramState } from "../Models";
import { StateManager } from "./stateManager";

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
  private IO: IO;

  private state: DiagramState;

  setCategories(categories: any[]) {
    this.stateManager.setCategories(categories);
    // ... update the data
  }

  calculateElementSize(domElement: HTMLElement) {
    return { width: domElement.clientWidth, height: domElement.clientHeight };
  }

  constructor(domElement: HTMLElement) {
    if (typeof document === 'undefined') {
      throw new Error('Diagram can work only in DOM-enabled environment (e.g. browser)!');
    }

    const canvasElement = document.createElement('canvas');
    const canvasContext = canvasElement.getContext('2d');

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
      throw new Error('Can\'t create canvas context!');
    }

    this.state = { links: [], nodes: [], categories: [], selectedLinks: [], selectedNodes: []};

    // create a main event bus
    this.eventBus = new EventBus();

    // initialize IO: mouse/keyboard logic will be there
    this.IO = new IO(this.eventBus, canvasElement);

    // initialize state manager
    this.stateManager = new StateManager(this.eventBus);

    // initialize renderer
    this.renderer = new Renderer(this.eventBus, canvasContext, this.stateManager);

    // ...start the rendering loop
    this.renderer.renderStart();
  }
}