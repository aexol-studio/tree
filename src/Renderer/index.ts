import { MinimapRenderer } from "./minimapRenderer";
import { ZoomPan } from "./zoomPan";
// import { MenuRenderer } from "./menuRenderer";
import { EventBus } from "../EventBus";
import { StateManager } from "../Diagram/stateManager";
import { DiagramEvents } from "../Events";
import { DiagramTheme } from "../Models";
import { NodeRenderer } from "./nodeRenderer";
import { ActiveLinkRenderer } from "./activeLinkRenderer";
import { LinkRenderer } from "./linkRenderer";
import { Cursor } from "../Models/Cursor";
import { Region } from "../QuadTree/Region";
import { CSSMiniEngine } from "./CssMiniEngine";
import { ContextProvider } from "./ContextProvider";
import { ConfigurationManager } from "../Configuration";

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
  private minimapRenderer = new MinimapRenderer();
  private nodeRenderer: NodeRenderer;
  private linkRenderer: LinkRenderer;
  private zoomPan: ZoomPan = new ZoomPan();
  private cssMiniEngine: CSSMiniEngine = new CSSMiniEngine();
  private activeLinkRenderer: ActiveLinkRenderer;
  private previousFrameTime: number = 0;
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
    private stateManager: StateManager,
    private theme: DiagramTheme
  ) {
    this.contextProvider = new ContextProvider(canvasContext);

    this.nodeRenderer = new NodeRenderer(
      this.contextProvider,
      this.theme,
      this.stateManager
    );

    this.activeLinkRenderer = new ActiveLinkRenderer(
      this.contextProvider,
      this.theme
    );
    this.linkRenderer = new LinkRenderer(this.contextProvider, this.theme);

    this.eventBus.subscribe(DiagramEvents.RenderRequested, this.renderStart);

    this.cssMiniEngine.compile();
  }
  getAllNodesArea = () => {
    const { nodes } = this.stateManager.pureState();

    const minPoint = nodes.reduce<{ x: number; y: number }>(
      (acc, curr) => ({
        x: Math.min(curr.x, acc.x),
        y: Math.min(curr.y, acc.y)
      }),
      {
        x: Number.MAX_SAFE_INTEGER,
        y: Number.MAX_SAFE_INTEGER
      }
    );

    const maxPoint = nodes.reduce<{ x: number; y: number }>(
      (acc, curr) => ({
        x: Math.max(curr.x, acc.x),
        y: Math.max(curr.y, acc.y)
      }),
      {
        x: Number.MIN_SAFE_INTEGER,
        y: Number.MIN_SAFE_INTEGER
      }
    );

    return new Region(minPoint, maxPoint);
  };
  getActiveArea = () => {
    const { uiState } = this.stateManager.getState();
    const width = uiState.areaSize.width / uiState.scale;
    const height = uiState.areaSize.height / uiState.scale;
    return new Region(
      {
        x: 0 - uiState.panX,
        y: 0 - uiState.panY
      },
      {
        x: width - uiState.panX,
        y: height - uiState.panY
      }
    );
  };
  setCursor(cursor: Cursor) {
    this.contextProvider.context.canvas.style.cursor = cursor;
  }
  /**
   * Render cursor.
   */
  renderCursor() {
    const state = this.stateManager.getState();
    if (state.drawedConnection) {
      this.setCursor("grabbing");
      return;
    }
    if (state.hover.node) {
      this.setCursor("move");
      if (state.hover.type && state.hover.node.definition.parent) {
        this.setCursor("pointer");
        return;
      }
      if (state.hover.io) {
        this.setCursor("crosshair");
        return;
      }
      return;
    }
    if (state.hover.description) {
      this.setCursor("text");
      return;
    }
    /*if (state.hover.menu) {
      this.setCursor("pointer");
      return;
    }*/
    if (state.hover.link) {
      this.setCursor("col-resize");
      return;
    }
    this.setCursor("grab");
  }
  /**
   * Render nodes.
   */
  renderNodes() {
    const region = this.stateManager.isScreenShotInProgress()
      ? this.getAllNodesArea()
      : this.getActiveArea();
    const state = this.stateManager.getState();
    const nodes = state.trees.node
      .queryRange(region)
      .concat(state.selectedNodes);
    for (const n of nodes) {
      const isSelected = state.selectedNodes.indexOf(n) !== -1;
      const isHovered = state.hover.node === n;
      const isRenamed = state.renamed && state.renamed === n;
      const isNodeMenuOpened = state.isNodeMenuOpened;
      const typeIsHovered = isHovered && state.hover.type;
      const inputActive = isHovered && state.hover.io == "i";
      const outputActive = isHovered && state.hover.io == "o";
      const currentScale = state.uiState.scale;

      this.nodeRenderer.render({
        node: n,
        isRenamed,
        isSelected,
        isHovered,
        isNodeMenuOpened,
        typeIsHovered,
        inputActive,
        outputActive,
        currentScale
      });
    }
  }

  /**
   * Render active link connection.
   */
  renderActiveLink() {
    const state = this.stateManager.getState();

    if (!state.draw) {
      return;
    }

    if (state.drawedConnection) {
      this.activeLinkRenderer.render({
        from: state.draw.initialPos,
        to: state.drawedConnection
      });
    }
  }

  /**
   * Render links
   */
  renderLinks() {
    const state = this.stateManager.getState();
    const region = this.stateManager.isScreenShotInProgress()
      ? this.getAllNodesArea()
      : this.getActiveArea();

    const linksInArea = state.trees.link.queryRange(region);
    linksInArea.forEach(l =>
      this.linkRenderer.render(l, "main", state.uiState.scale)
    );
    state.links
      .filter(l => state.selectedNodes.find(n => n === l.i || n === l.o))
      .forEach(l => this.linkRenderer.render(l, "active", state.uiState.scale));
    state.hover.link &&
      this.linkRenderer.render(state.hover.link, "hover", state.uiState.scale);
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

  /**
   * render minimap in top right corner
   *
   * @memberof Renderer
   */
  renderMinimap() {
    this.minimapRenderer.render(
      this.contextProvider.context,
      this.theme,
      this.stateManager.getState()
    );
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
    const timeCoefficient = this.calculateTimeDelta(timePassed);

    // render loop
    this.setScreenTransform();
    this.renderBackground();

    this.setWorldTransform();

    // this.context.scale(4, 4)

    this.renderLinks();
    this.renderActiveLink();
    this.renderNodes();

    this.setScreenTransform();
    this.renderMinimap();
    this.renderCursor();

    if (this.animate(timeCoefficient)) {
      this.previousFrameTime = timePassed;
    } else {
      this.resetTimeCounter();
    }

    if (this.stateManager.isScreenShotInProgress()) {
      this.eventBus.publish(
        DiagramEvents.ScreenShotRendered,
        this.screenShotCanvasContext
      );
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
