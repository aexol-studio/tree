import { MinimapRenderer } from "./minimapRenderer";
import { ZoomPan } from "./zoomPan";
// import { MenuRenderer } from "./menuRenderer";
import { EventBus } from "../EventBus";
import { StateManager } from "../Diagram/stateManager";
import { DiagramEvents } from "../Events";
import { Colors } from "../Theme/Colors";
import { DiagramTheme } from "../Models";
import { NodeRenderer } from "./nodeRenderer";
import { ActiveLinkRenderer } from "./activeLinkRenderer";
import { LinkRenderer } from "./linkRenderer";
import { Cursor } from "../Models/Cursor";
import { Region } from "../QuadTree/Region";
import { CSSMiniEngine } from "./CssMiniEngine";


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
  // private zoomPan = new ZoomPan();
  // private menuRenderer: MenuRenderer;
  private nodeRenderer: NodeRenderer;
  // private renameRenderer: RenameRenderer;
  // private descriptionRenderer: DescriptionRenderer;
  private linkRenderer: LinkRenderer;
  private zoomPan: ZoomPan = new ZoomPan();
  private cssMiniEngine: CSSMiniEngine = new CSSMiniEngine();
  private activeLinkRenderer: ActiveLinkRenderer;
  private previousFrameTime: number = 0;
  /**
   * @param eventBus event bus instance to be used
   * @param context context from the canvas
   * @param stateManager state manager instance to fetch data from
   * @param theme Color and positional options of diagram
   */
  constructor(
    private eventBus: EventBus,
    private context: CanvasRenderingContext2D,
    private stateManager: StateManager,
    private theme: DiagramTheme
  ) {
    this.nodeRenderer = new NodeRenderer(this.context, this.theme);

    this.activeLinkRenderer = new ActiveLinkRenderer(this.context, this.theme);
    this.linkRenderer = new LinkRenderer(this.context, this.theme);

    this.eventBus.subscribe(DiagramEvents.RenderRequested, this.renderStart);

    this.cssMiniEngine.compile();
  }
  getActiveArea = () => {
    const { uiState } = this.stateManager.getState();
    const width = uiState.areaSize.width / uiState.scale;
    const height = uiState.areaSize.height / uiState.scale;
    return new Region(
      {
        x: 0 - uiState.panX!,
        y: 0 - uiState.panY!
      },
      {
        x: width - uiState.panX!,
        y: height - uiState.panY!
      }
    );
  };
  setCursor(cursor: Cursor) {
    this.context.canvas.style.cursor = cursor;
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
    const state = this.stateManager.getState();
    const nodes = state.trees.node
      .queryRange(this.getActiveArea())
      .concat(state.selectedNodes);
    for (const n of nodes) {
      const isSelected = state.selectedNodes.indexOf(n) !== -1;
      const isHovered = state.hover.node === n;
      const isRenamed = state.renamed && state.renamed === n;
      const typeIsHovered = isHovered && state.hover.type;
      const inputActive = isHovered && state.hover.io == "i";
      const outputActive = isHovered && state.hover.io == "o";
      const currentScale = state.uiState.scale;

      this.nodeRenderer.render({
        node: n,
        isRenamed,
        isSelected,
        isHovered,
        typeIsHovered,
        inputActive,
        outputActive,
        currentScale,
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
    const linksInArea = state.trees.link.queryRange(this.getActiveArea());
    linksInArea.forEach(l => this.linkRenderer.render(l, "main", state.uiState.scale));
    state.links
      .filter(l => state.selectedNodes.find(n => n === l.i || n === l.o))
      .forEach(l => this.linkRenderer.render(l, "active", state.uiState.scale));
    state.hover.link && this.linkRenderer.render(state.hover.link, "hover", state.uiState.scale);
  }

  /**
   * Renders background of canvas
   *
   * @memberof Renderer
   */
  renderBackground() {
    const { width, height } = this.context.canvas;
    this.context.fillStyle = this.theme.colors.background
    this.context.fillRect(0, 0, width, height);
  }

  /**
   * render minimap in top right corner
   *
   * @memberof Renderer
   */
  renderMinimap() {
    this.minimapRenderer.render(
      this.context,
      this.theme,
      this.stateManager.getState()
    );
  }

  setScreenTransform() {
    this.zoomPan.setUniformMatrix(this.context);
  }

  setWorldTransform() {
    const uiState = this.stateManager.pureState().uiState;
    this.zoomPan.setCalculatedMatrix(this.context, uiState);
  }

  renderStart = () => {
    window.requestAnimationFrame(this.render);
  };

  renderUpdate = () => {
    window.requestAnimationFrame(this.render);
  };

  animate = (timeCoefficient: number) => {
    return this.stateManager.calculateAnimations(timeCoefficient);
  }

  calculateTimeDelta = (timePassed: number) => {
    if (this.previousFrameTime === 0) {
      return 1.0;
    } else {
      return (timePassed - this.previousFrameTime) / 16.0;
    }
  }

  resetTimeCounter = () => {
    this.previousFrameTime = 0;
  }

  render = (timePassed: number) => {
    const timeCoefficient = this.calculateTimeDelta(timePassed);

    // render loop
    this.setScreenTransform();
    this.renderBackground();

    this.setWorldTransform();
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
  };
}
