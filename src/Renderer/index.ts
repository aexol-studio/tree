import { MinimapRenderer } from "./minimapRenderer";
// import { ZoomPan } from './zoomPan';
import { MenuRenderer } from "./menuRenderer";
import { EventBus } from "../EventBus";
import { StateManager } from "../Diagram/stateManager";
import { DiagramEvents } from "../Events";
import { Colors } from "../Theme/Colors";
import { DiagramTheme } from "../Models";
import { NodeRenderer } from "./nodeRenderer";
import { ActiveLinkRenderer } from "./activeLinkRenderer";
import { LinkRenderer } from "./linkRenderer";
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
  private menuRenderer: MenuRenderer;
  private nodeRenderer: NodeRenderer;
  private linkRenderer: LinkRenderer;
  private activeLinkRenderer: ActiveLinkRenderer;

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
    this.menuRenderer = new MenuRenderer(this.context, this.theme);
    this.activeLinkRenderer = new ActiveLinkRenderer(this.context, this.theme);
    this.linkRenderer = new LinkRenderer(this.context, this.theme);
    this.eventBus.subscribe(DiagramEvents.RenderRequested, this.render);
  }

  /**
   * Render cursor.
   */
  renderCursor() {
    const state = this.stateManager.getState();
    if (state.hover.node) {
      this.context.canvas.style.cursor = "move";
      if (state.hover.io) {
        this.context.canvas.style.cursor = "pointer";
        return;
      }
      return;
    }
    if (state.hover.menu) {
      this.context.canvas.style.cursor = "pointer";
      return;
    }
    this.context.canvas.style.cursor = "auto";
  }
  /**
   * Render nodes.
   */
  renderNodes() {
    const state = this.stateManager.getState();
    state.nodes.forEach(node =>
      this.nodeRenderer.render({
        node,
        isHovered: state.hover.node === node,
        isSelected: state.selectedNodes.indexOf(node) !== -1,
        inputActive: state.hover.node === node && state.hover.io == "i",
        outputActive: state.hover.node === node && state.hover.io == "o"
      })
    );
  }

  /**
   * Render active link connection.
   */
  renderActiveLink() {
    const state = this.stateManager.getState();
    if (state.drawedConnection && state.lastPosition) {
      this.activeLinkRenderer.render({
        from: state.lastPosition,
        to: state.drawedConnection
      });
    }
  }

  /**
   * Render links
   */
  renderLinks() {
    const state = this.stateManager.getState();
    state.links.forEach(this.linkRenderer.render);
  }

  /**
   * Example method!
   * @param something
   */
  renderSomething(something: any) {
    // ...
  }

  /**
   * Example method!
   */
  renderBackground() {
    const { width, height } = this.context.canvas;
    this.context.fillStyle = Colors.grey[6];
    this.context.fillRect(0, 0, width, height);
  }

  renderMenu() {
    const state = this.stateManager.getState();
    const index = state.hover.menu ? state.hover.menu.index : undefined;
    if (state.menu) {
      this.menuRenderer.render(state.menu.position, state.categories, index);
    }
  }

  renderStart() {
    window.requestAnimationFrame(this.render);
  }
  renderUpdate = () => {
    window.requestAnimationFrame(this.render);
  };

  render = () => {
    // (...) render loop
    // const transform = this.zoomPan.calculateTransform();
    this.minimapRenderer.render(this.context);

    this.renderCursor();
    this.renderBackground();
    this.renderLinks();
    this.renderNodes();
    this.renderMenu();
    this.renderActiveLink();
  };
}
