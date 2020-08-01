import { Renderer } from "@renderer/index";
import { EventBus } from "@eventBus";
import { StateManager } from "./stateManager";
import { IO, ScreenPosition } from "@io";
import { Node, Size, Link, NodeDefinition } from "@models";
import { NodeUtils } from "@utils";
import { DiagramOptions, ConfigurationManager } from "@configuration";
import { CSSMiniEngine } from "@renderer/CssMiniEngine/index";

/**
 * Diagram:
 *
 * Main class. Responsibilities:
 * - instantiating the diagram in the DOM element given by constructor
 * - initializing all of the subcomponents: renderer, IO, state manager etc.
 */
export class Diagram {
  private renderer: Renderer;
  private currentHostSize: Size;
  private stateManager: StateManager;
  private canvasElement: HTMLCanvasElement;
  private htmlElement: HTMLDivElement;
  private io: IO;
  public eventBus: EventBus;
  public configuration: ConfigurationManager;

  openMenu = (e: ScreenPosition) => {
    this.stateManager.openMenu(e);
  };
  setDefinitions(nodeDefinitions: NodeDefinition[]) {
    this.stateManager.setDefinitions(nodeDefinitions);
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
  centerOnNode(node: Node) {
    this.stateManager.centerOnNode(node);
  }
  selectNode(node: Node) {
    this.stateManager.selectNode(node);
  }
  setReadOnly(isReadOnly: boolean) {
    this.stateManager.setReadOnly(isReadOnly);
  }
  requestSerialise() {
    this.stateManager.requestSerialise();
  }
  rebuildTrees() {
    this.stateManager.rebuildTrees();
  }
  beautifyDiagram(nodes: Node[]) {
    NodeUtils.beautifyDiagram(nodes, this.configuration.getOption("theme"));
  }
  forceRender() {
    this.eventBus.publish("RenderRequested");
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
      height: targetSize.height * 2,
    };

    this.canvasElement.width = areaSize.width;
    this.canvasElement.height = areaSize.height;

    this.canvasElement.style.width = `${targetSize.width}px`;
    this.canvasElement.style.height = `${targetSize.height}px`;

    this.stateManager.areaResized({
      width: this.canvasElement.width,
      height: this.canvasElement.height,
    });

    this.io.calculateClientBoundingRect();
  }
  private calculateElementSize(domElement: HTMLElement) {
    return { width: domElement.clientWidth, height: domElement.clientHeight };
  }
  autoResize = () => {
    if (this.stateManager.isScreenShotInProgress()) {
      return;
    }

    const newHostSize = this.calculateElementSize(this.hostDomElement);
    if (
      newHostSize.width !== this.currentHostSize.width ||
      newHostSize.height !== this.currentHostSize.height
    ) {
      this.currentHostSize = newHostSize;

      const areaSize = {
        width: newHostSize.width * 2,
        height: newHostSize.height * 2,
      };

      this.canvasElement.width = areaSize.width;
      this.canvasElement.height = areaSize.height;

      this.canvasElement.style.width = `100%`;
      this.canvasElement.style.height = `100%`;

      this.stateManager.areaResized({
        width: this.canvasElement.width,
        height: this.canvasElement.height,
      });
      this.io.calculateClientBoundingRect();
    }
  };

  private wireUpResizer() {
    if (this.configuration.getOption("autosizeOnWindowResize")) {
      window.addEventListener("resize", () => {
        this.autoResize();
      });
    }
  }

  private getHostElement = () => {
    return this.hostDomElement;
  };

  constructor(
    private hostDomElement: HTMLElement,
    options?: Partial<DiagramOptions>
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

    if (!canvasContext) {
      throw new Error("Can't create canvas context!");
    }

    canvasContext.font = `10px ${
      this.configuration.getOption("theme").fontFamily
    }`;

    this.htmlElement = document.createElement("div");
    this.htmlElement.classList.add("DiagramHTMLRoot");

    const hostSize = this.calculateElementSize(hostDomElement);

    this.currentHostSize = hostSize;

    this.canvasElement.oncontextmenu = () => false;

    const targetWidth = this.configuration.getOption("width") || hostSize.width;
    const targetHeight =
      this.configuration.getOption("height") || hostSize.height;

    const areaSize = {
      width: targetWidth * 2,
      height: targetHeight * 2,
    };

    this.canvasElement.width = areaSize.width;
    this.canvasElement.height = areaSize.height;

    this.canvasElement.style.width = `${targetWidth}px`;
    this.canvasElement.style.height = `${targetHeight}px`;

    while (hostDomElement.firstChild) {
      hostDomElement.removeChild(hostDomElement.firstChild);
    }

    if (window.getComputedStyle(hostDomElement).position === "static") {
      hostDomElement.style.position = "relative";
    }

    hostDomElement.appendChild(this.canvasElement);
    hostDomElement.appendChild(this.htmlElement);
    // create a main event bus
    this.eventBus = new EventBus();
    window.graphsource = this.eventBus;
    // initialize IO: mouse/keyboard logic will be there
    this.io = new IO(this.eventBus, this.canvasElement);

    // initialize state manager
    this.stateManager = new StateManager(
      this.eventBus,
      this.configuration.getOption("theme"),
      this.configuration.getOption("connectionFunction"),
      this.configuration.getOption("disableLinkOperations"),
      this.getHostElement,
      areaSize
    );

    // initialize renderer
    this.renderer = new Renderer(
      this.eventBus,
      canvasContext,
      this.htmlElement,
      this.stateManager,
      this.configuration.getOption("theme")
    );

    if (this.configuration.getOption("autosizeWatcher")) {
      setInterval(
        this.autoResize,
        this.configuration.getOption("autosizeInterval")
      );
    }

    CSSMiniEngine.instance.compile();

    // ...start the rendering loop
    // this.autoResize();
    this.wireUpResizer();
    this.renderer.renderStart();
  }

  screenShot = async (
    type: "image/png" | "image/jpeg" = "image/png"
  ): Promise<Blob | null> => {
    return new Promise((resolve) => {
      this.stateManager.setScreenShotInProgress(true);

      const currentNodes = this.stateManager.pureState().nodes;
      const screenShotMargin = this.configuration.getOption("screenShotMargin");
      const {
        width: nodeWidth,
        height: nodeHeight,
      } = this.configuration.getOption("theme").node;

      const rangeX = currentNodes.reduce(
        (acc, cur) => [Math.min(cur.x, acc[0]), Math.max(cur.x, acc[1])],
        [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
      );

      const rangeY = currentNodes.reduce(
        (acc, cur) => [Math.min(cur.y, acc[0]), Math.max(cur.y, acc[1])],
        [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
      );

      const savedUiState = { ...this.stateManager.getState().uiState };
      this.renderer.createScreenShotContext(
        rangeX[0] - screenShotMargin,
        rangeX[1] + screenShotMargin + nodeWidth,
        rangeY[0] - screenShotMargin,
        rangeY[1] + screenShotMargin + nodeHeight
      );

      if (savedUiState) {
        const screenShotRenderedCallback = ({
          context,
        }: {
          context: CanvasRenderingContext2D;
        }) => {
          context.canvas.toBlob((blob) => {
            resolve(blob);
          }, type);
          this.stateManager.setScreenShotInProgress(false);
          this.renderer.releaseScreenShotContext();

          this.stateManager.getState().uiState.panX = savedUiState.panX;
          this.stateManager.getState().uiState.panY = savedUiState.panY;
          this.stateManager.getState().uiState.scale = savedUiState.scale;

          this.eventBus.off("ScreenShotRendered", screenShotRenderedCallback);
        };

        this.eventBus.on("ScreenShotRendered", screenShotRenderedCallback);
        this.eventBus.publish("RenderRequested");
      }
    });
  };
}
