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
import { Cursor } from "../Models/Cursor";
import { DescriptionRenderer } from "./descriptionRenderer";
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
  private descriptionRenderer: DescriptionRenderer;
  private linkRenderer: LinkRenderer;
  private activeLinkRenderer: ActiveLinkRenderer;
  private caret: string = " ";

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
    this.nodeRenderer = new NodeRenderer(this.context, this.theme);
    this.descriptionRenderer = new DescriptionRenderer(
      this.context,
      this.theme
    );
    this.menuRenderer = new MenuRenderer(this.context, this.theme);
    this.activeLinkRenderer = new ActiveLinkRenderer(this.context, this.theme);
    this.linkRenderer = new LinkRenderer(this.context, this.theme);
    this.eventBus.subscribe(DiagramEvents.RenderRequested, this.render);
    this.renameNode()
  }

  renameNode = () => {
    this.caret = this.caret === "|" ? " " : "|";
    this.eventBus.publish(DiagramEvents.RenderRequested);
    setTimeout(this.renameNode, 500);
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
    if (state.hover.menu) {
      this.setCursor("pointer");
      return;
    }
    this.setCursor("auto");
  }
  /**
   * Render nodes.
   */
  renderNodes() {
    const state = this.stateManager.getState();
    for (const n of state.nodes) {
      const isSelected = state.selectedNodes.indexOf(n) !== -1;
      const isRenamed = !!(state.renamed && state.renamed.node === n);
      const isHovered = state.hover.node === n;
      const inputActive = state.hover.node === n && state.hover.io == "i";
      const outputActive = state.hover.node === n && state.hover.io == "o";
      const node = {
        ...n
      };
      if (isRenamed && isSelected && state.selectedNodes.length === 1) {
        node.name = node.name + this.caret;
      }
      this.nodeRenderer.render({
        node,
        isSelected,
        isHovered,
        inputActive,
        outputActive
      });
    }
  }
  /**
   * Render descriptions.
   */
  renderDescriptions() {
    const {
      hover: { node }
    } = this.stateManager.getState();
    node && this.descriptionRenderer.render({ node });
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
    state.links.forEach(l => this.linkRenderer.render(l, false));
    state.links
      .filter(l => state.selectedNodes.indexOf(l.i) !== -1)
      .forEach(l => this.linkRenderer.render(l, true));
    state.links
      .filter(l => state.selectedNodes.indexOf(l.o) !== -1)
      .forEach(l => this.linkRenderer.render(l, true));
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
    this.renderDescriptions();
    this.renderMenu();
    this.renderActiveLink();
  };
}
