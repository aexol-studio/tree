import { Renderer } from "../Renderer";
import { EventBus } from "../EventBus";
import { StateManager } from "./stateManager";
import { IO } from "../IO";
import { DiagramTheme, Node, Size, Link, DiagramState } from "../Models";

import { DefaultDiagramTheme } from "../Theme/DefaultDiagramTheme";
import { NodeDefinition } from "../Models/NodeDefinition";
import { NodeUtils } from "../Utils/index";

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
  private currentHostSize: Size;
  private stateManager: StateManager;
  private canvasElement: HTMLCanvasElement;

  setDefinitions(nodeDefinitions: NodeDefinition[]) {
    this.stateManager.setDefinitions(nodeDefinitions);
  }
  setSerialisationFunction(fn: DiagramState["serialisationFunction"]) {
    this.stateManager.setSerialisationFunction(fn);
  }
  setPositionSerialisationFunction(
    fn: DiagramState["positionSerialisationFunction"]
  ) {
    this.stateManager.setPositionSerialisationFunction(fn);
  }
  setNodes(nodes: Node[], beautify?: boolean) {
    if (beautify) {
      this.beautifyDiagram(nodes);
    }
    this.stateManager.setNodes(nodes);
  }
  setLinks(links: Link[]) {
    this.stateManager.setLinks(links);
  }
  requestSerialise() {
    this.stateManager.requestSerialise();
  }
  rebuildTrees() {
    this.stateManager.rebuildTrees();
  }
  beautifyDiagram(nodes: Node[]) {
    NodeUtils.beautifyDiagram(nodes, this.theme);
  }
  centerDiagram() {
    this.stateManager.centerGraph();
  }
  zeroDiagram() {
    this.stateManager.zeroGraph();
  }
  calculateElementSize(domElement: HTMLElement) {
    return { width: domElement.clientWidth, height: domElement.clientHeight };
  }
  resize = () => {
    const newHostSize = this.calculateElementSize(this.domElement);
    if (
      newHostSize.width !== this.currentHostSize.width ||
      newHostSize.height !== this.currentHostSize.height
    ) {
      this.currentHostSize = newHostSize;

      const areaSize = {
        width: newHostSize.width * 2,
        height: newHostSize.height * 2
      };

      this.canvasElement.width = areaSize.width;
      this.canvasElement.height = areaSize.height;

      this.canvasElement.style.width = `100%`;
      this.canvasElement.style.height = `100%`;

      this.stateManager.areaResized({
        width: this.canvasElement.width,
        height: this.canvasElement.height
      });
    }
  };
  wireUpResizer() {
    window.addEventListener("resize", () => {
      this.resize();
    });
  }

  constructor(
    private domElement: HTMLElement,
    private theme: DiagramTheme = DefaultDiagramTheme,
    connectionFunction: (input: Node, output: Node) => boolean = (
      input,
      output
    ) => true
  ) {
    if (typeof document === "undefined") {
      throw new Error(
        "Diagram can work only in DOM-enabled environment (e.g. browser)!"
      );
    }

    this.canvasElement = document.createElement("canvas");
    const canvasContext = this.canvasElement.getContext("2d");

    canvasContext!.font = "10px Helvetica";

    const hostSize = this.calculateElementSize(document.body);

    this.currentHostSize = hostSize;

    this.canvasElement.oncontextmenu = () => false;

    const areaSize = {
      width: hostSize.width * 2,
      height: hostSize.height * 2
    };

    this.canvasElement.width = areaSize.width;
    this.canvasElement.height = areaSize.height;

    this.canvasElement.style.width = `${hostSize.width}px`;
    this.canvasElement.style.height = `${hostSize.height}px`;

    while (domElement.firstChild) {
      domElement.removeChild(domElement.firstChild);
    }

    domElement.appendChild(this.canvasElement);
    if (!canvasContext) {
      throw new Error("Can't create canvas context!");
    }
    // create a main event bus
    this.eventBus = new EventBus();

    // initialize IO: mouse/keyboard logic will be there
    new IO(this.eventBus, this.canvasElement);

    // initialize state manager
    this.stateManager = new StateManager(
      this.eventBus,
      theme,
      connectionFunction,
      areaSize
    );

    // initialize renderer
    this.renderer = new Renderer(
      this.eventBus,
      canvasContext,
      this.stateManager,
      theme
    );
    this.wireUpResizer();
    setInterval(this.resize, 1000);
    // ...start the rendering loop
    this.renderer.renderStart();
  }
}
