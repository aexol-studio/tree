import { CursorRenderer } from './cursorRenderer';
import { MinimapRenderer } from './minimapRenderer';
import { ZoomPan } from './zoomPan';
import { MenuRenderer } from './menuRenderer';
import { EventBus } from '../EventBus';
import { StateManager } from '../Diagram/stateManager';

/**
 * Renderer.
 *
 * Main renderer service. Responsibilities:
 * - store context for canvas drawing
 * - set up the render loop
 * - render nodes, links and particular subcomponents (cursor, menu, minimap etc.)
 *
 * - IMPORTANT -
 * - Currently, render loop is handled by requestAnimationFrame.
 * - It might be worth considering invoking rerendering
 * - e.g. only when application state has changed.
 */
export class Renderer {
  private cursorRenderer = new CursorRenderer();
  private minimapRenderer = new MinimapRenderer();
  private zoomPan = new ZoomPan();
  private menuRenderer = new MenuRenderer();

  private context: CanvasRenderingContext2D;
  private eventBus: EventBus;
  private stateManager: StateManager;

  /**
   * @param eventBus event bus instance to be used
   * @param context context from the canvas
   * @param stateManager state manager instance to fetch data from
   */
  constructor(eventBus: EventBus, context: CanvasRenderingContext2D, stateManager: StateManager) {
    // ...
    // initialization
    this.eventBus = eventBus;
    this.context = context;
    this.stateManager = stateManager;

    // possibility to re-render on particular
    this.eventBus.subscribe('fooBarXyzAbc', this.render);

    this.render = this.render.bind(this);
  }

  /**
   * Example method!
   * @param nodes
   */
  renderNodes(nodes: any) {
    const state = this.stateManager.getState();
    this.context.fillStyle = '#aaa';

    state.nodes.forEach(node => {
      this.context.fillRect(node.x!, node.y!, 60, 20);
    });
  }

  /**
  * Example method!
  * @param links
  */
  renderLinks(links: any) {
    // ...
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
    this.context.fillStyle = '#555';
    this.context.fillRect(0, 0, width, height);
  }

  renderStart() {
    window.requestAnimationFrame(this.render);
  }

  render() {
    // (...) render loop
    const transform = this.zoomPan.calculateTransform();
    this.cursorRenderer.render(this.context);
    this.minimapRenderer.render(this.context);
    this.menuRenderer.render(this.context);

    this.renderBackground();
    this.renderNodes([]);
    this.renderLinks([]);

    window.requestAnimationFrame(this.render);
  }
}
