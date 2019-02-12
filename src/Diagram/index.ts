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
  calculateElementSize(domElement: HTMLElement) {
    return { width: domElement.clientWidth, height: domElement.clientHeight };
  }

  wireUpResizer(domElement: HTMLElement, canvasElement: HTMLCanvasElement) {
    window.addEventListener("resize", () => {
      const newHostSize = this.calculateElementSize(domElement);
      console.log(newHostSize);
      if (
        newHostSize.width !== this.currentHostSize.width ||
        newHostSize.height !== this.currentHostSize.height
      ) {
        this.currentHostSize = newHostSize;

        const areaSize = {
          width: newHostSize.width * 2,
          height: newHostSize.height * 2
        };

        canvasElement.width = areaSize.width;
        canvasElement.height = areaSize.height;

        canvasElement.style.width = `${newHostSize.width}px`;
        canvasElement.style.height = `${newHostSize.height}px`;

        this.stateManager.areaResized({
          width: canvasElement.width,
          height: canvasElement.height
        });
      }
    });
  }

  constructor(
    domElement: HTMLElement,
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

    const canvasElement = document.createElement("canvas");
    const canvasContext = canvasElement.getContext("2d");

    canvasContext!.font = "10px Helvetica";

    const hostSize = this.calculateElementSize(domElement);

    this.currentHostSize = hostSize;

    canvasElement.oncontextmenu = () => false;

    const areaSize = {
      width: hostSize.width * 2,
      height: hostSize.height * 2
    };

    canvasElement.width = areaSize.width;
    canvasElement.height = areaSize.height;

    canvasElement.style.width = `${hostSize.width}px`;
    canvasElement.style.height = `${hostSize.height}px`;

    while (domElement.firstChild) {
      domElement.removeChild(domElement.firstChild);
    }

    domElement.appendChild(canvasElement);

    this.wireUpResizer(domElement, canvasElement);

    if (!canvasContext) {
      throw new Error("Can't create canvas context!");
    }

    // create a main event bus
    this.eventBus = new EventBus();

    // initialize IO: mouse/keyboard logic will be there
    new IO(this.eventBus, canvasElement);

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

    // ...start the rendering loop
    this.renderer.renderStart();
  }
}
