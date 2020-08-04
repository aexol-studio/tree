import { ZoomPan } from "./zoomPan";
// import { MenuRenderer } from "./menuRenderer";
import { EventBus } from "@eventBus";
import { StateManager } from "@diagram/stateManager";
import { DiagramTheme } from "@models";
import { NodeRenderer } from "./nodeRenderer";
import { Cursor } from "@models";
import { CSSMiniEngine, css } from "./CssMiniEngine";
import { ContextProvider } from "./ContextProvider";
import { ConfigurationManager } from "@configuration";

/**
 * Renderer.
 *
 * Main renderer service. Responsibilities:
 * - store context for canvas drawing
 * - set up the render loop
 * - render nodes, links and particular subcomponents (cursor, menu, minimap etc.)
 *
 */
export class Renderer {
  private nodeRenderer: NodeRenderer;
  private zoomPan: ZoomPan = new ZoomPan();
  private cssMiniEngine: CSSMiniEngine = new CSSMiniEngine();
  private previousFrameTime = 0;
  private screenShotCanvasContext: CanvasRenderingContext2D | null = null;
  private contextProvider: ContextProvider;
  /**
   * @param eventBus event bus instance to be used
   * @param context context from the canvas
   * @param stateManager state manager instance to fetch data from
   * @param theme Color and positional options of diagram
   */
  constructor(
    private eventBus: EventBus,
    private canvasContext: CanvasRenderingContext2D,
    private htmlElement: HTMLDivElement,
    private stateManager: StateManager,
    private theme: DiagramTheme
  ) {
    this.contextProvider = new ContextProvider(canvasContext);

    this.nodeRenderer = new NodeRenderer(
      this.theme,
      this.stateManager,
      this.cssMiniEngine
    );

    this.eventBus.subscribe("RenderRequested", this.renderStart);
    this.cssMiniEngine.addCss(css`
      .DiagramHTMLRoot {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 100;
      }
    `);
    this.cssMiniEngine.compile();
  }
  selectNodes() {
    this.stateManager.getState().selectedNodes;
    this.htmlElement
      .querySelectorAll(".Node")
      .forEach((n) => n.classList.add(".NodeSelected"));
    this.htmlElement
      .querySelectorAll(".NodeField")
      .forEach((n) => n.classList.add(".NodeFieldSelected"));
  }

  setCursor(cursor: Cursor) {
    this.contextProvider.context.canvas.style.cursor = cursor;
  }
  /**
   * Render nodes.
   */
  renderNodes() {
    const state = this.stateManager.getState();
    const nodes = state.nodes;
    return nodes
      .filter((n) => !n.outputs || n.outputs.length === 0)
      .map((n) => {
        const isRenamed = state.renamed && state.renamed === n;
        const isNodeMenuOpened = state.isNodeMenuOpened;
        const currentScale = state.uiState.scale;

        return this.nodeRenderer.render({
          node: n,
          isRenamed,
          isNodeMenuOpened,
          currentScale,
        });
      })
      .join("");
  }

  /**
   * Renders background of canvas
   *
   * @memberof Renderer
   */
  renderBackground() {
    if (
      this.stateManager.isScreenShotInProgress() &&
      !ConfigurationManager.instance.getOption("screenShotBackground")
    ) {
      return;
    }
    const { width, height } = this.contextProvider.context.canvas;
    this.contextProvider.context.fillStyle = this.theme.colors.background;
    this.contextProvider.context.fillRect(0, 0, width, height);
  }

  setScreenTransform() {
    this.zoomPan.setUniformMatrix(this.contextProvider.context);
  }

  setWorldTransform() {
    const uiState = this.stateManager.pureState().uiState;
    this.zoomPan.setCalculatedMatrix(this.contextProvider.context, uiState);
  }

  renderStart = () => {
    window.requestAnimationFrame(this.render);
  };

  renderUpdate = () => {
    window.requestAnimationFrame(this.render);
  };

  animate = (timeCoefficient: number) => {
    return this.stateManager.calculateAnimations(timeCoefficient);
  };

  calculateTimeDelta = (timePassed: number) => {
    if (this.previousFrameTime === 0) {
      return 1.0;
    } else {
      return (timePassed - this.previousFrameTime) / 16.0;
    }
  };

  resetTimeCounter = () => {
    this.previousFrameTime = 0;
  };

  render = (timePassed: number) => {
    console.log("Rend");
    const timeCoefficient = this.calculateTimeDelta(timePassed);

    // render loop
    this.setScreenTransform();
    this.renderBackground();

    this.setWorldTransform();

    // this.context.scale(4, 4)

    this.htmlElement.innerHTML = this.renderNodes();
    this.setScreenTransform();

    if (this.animate(timeCoefficient)) {
      this.previousFrameTime = timePassed;
    } else {
      this.resetTimeCounter();
    }

    if (
      this.stateManager.isScreenShotInProgress() &&
      this.screenShotCanvasContext
    ) {
      this.eventBus.publish("ScreenShotRendered", {
        context: this.screenShotCanvasContext,
      });
    }
  };

  createScreenShotContext(
    startX: number,
    endX: number,
    startY: number,
    endY: number
  ) {
    const screenShotCanvas = document.createElement("canvas");
    screenShotCanvas.width = Math.abs(endX - startX);
    screenShotCanvas.height = Math.abs(endY - startY);
    this.screenShotCanvasContext = screenShotCanvas.getContext("2d");
    if (this.screenShotCanvasContext) {
      this.contextProvider.switchContext(this.screenShotCanvasContext);
      this.stateManager.getState().uiState.panX = -startX;
      this.stateManager.getState().uiState.panY = -startY;
      this.stateManager.getState().uiState.scale = 1.0;
    }
  }

  releaseScreenShotContext() {
    this.screenShotCanvasContext = null;
    this.contextProvider.switchContext(this.canvasContext);
  }
}
