import { Renderer } from "../Renderer";
import { EventBus, Topic } from "../EventBus";
import { StateManager } from "./stateManager";
import { IO } from "../IO";
import { Node, Size, Link, DiagramState } from "../Models";

import { NodeDefinition } from "../Models/NodeDefinition";
import { NodeUtils } from "../Utils/index";
import { DiagramOptions, ConfigurationManager } from "../Configuration/index";

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
  public configuration: ConfigurationManager;

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
  on(topic: Topic | string, callback: Function) {
    return this.eventBus.on(topic, callback);
  }
  off(topic: Topic | string, callback: Function) {
    return this.eventBus.off(topic, callback);
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
    NodeUtils.beautifyDiagram(nodes, this.configuration.getOption('theme'));
  }
  centerDiagram() {
    this.stateManager.centerGraph();
  }
  zeroDiagram() {
    this.stateManager.zeroGraph();
  }
  resize(width: number, height: number) {
    const targetSize = {
      width,
      height,
    };

    this.currentHostSize = targetSize;

    const areaSize = {
      width: targetSize.width * 2,
      height: targetSize.height * 2
    };

    this.canvasElement.width = areaSize.width;
    this.canvasElement.height = areaSize.height;

    this.canvasElement.style.width = `${targetSize.width}px`;
    this.canvasElement.style.height = `${targetSize.height}px`;

    this.stateManager.areaResized({
      width: this.canvasElement.width,
      height: this.canvasElement.height
    });
  }
  private calculateElementSize(domElement: HTMLElement) {
    return { width: domElement.clientWidth, height: domElement.clientHeight };
  }
  autoResize = () => {
    const newHostSize = this.calculateElementSize(this.hostDomElement);
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
      this.autoResize();
    });
  }

  constructor(
    private hostDomElement: HTMLElement,
    options?: Partial<DiagramOptions>,
  ) {
    if (typeof document === "undefined") {
      throw new Error(
        "Diagram can work only in DOM-enabled environment (e.g. browser)!"
      );
    }

    this.configuration = new ConfigurationManager(options || {});

    this.canvasElement = document.createElement("canvas");
    this.canvasElement.tabIndex = -1;
    this.canvasElement.style.outline = "none";
    const canvasContext = this.canvasElement.getContext("2d");

    canvasContext!.font = "10px Helvetica";

    const hostSize = this.calculateElementSize(hostDomElement);

    this.currentHostSize = hostSize;

    this.canvasElement.oncontextmenu = () => false;

    const targetWidth = this.configuration.getOption('width') || hostSize.width;
    const targetHeight = this.configuration.getOption('height') || hostSize.height;

    const areaSize = {
      width: targetWidth * 2,
      height: targetHeight * 2
    };

    this.canvasElement.width = areaSize.width;
    this.canvasElement.height = areaSize.height;

    this.canvasElement.style.width = `${targetWidth}px`;
    this.canvasElement.style.height = `${targetHeight}px`;

    while (hostDomElement.firstChild) {
      hostDomElement.removeChild(hostDomElement.firstChild);
    }

    hostDomElement.appendChild(this.canvasElement);
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
      this.configuration.getOption('theme'),
      this.configuration.getOption('connectionFunction'),
      areaSize
    );

    // initialize renderer
    this.renderer = new Renderer(
      this.eventBus,
      canvasContext,
      this.stateManager,
      this.configuration.getOption('theme'),
    );

    if (this.configuration.getOption('autosizeWatcher')) {
      setInterval(this.autoResize, this.configuration.getOption('autosizeInterval'));
    }

    if (this.configuration.getOption('autosizeOnWindowResize')) {
      this.wireUpResizer();
    }
    // ...start the rendering loop
    this.renderer.renderStart();
  }
}
