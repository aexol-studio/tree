import { EventBus } from "../EventBus";
import { DiagramState } from "../Models/DiagramState";
import * as Events from '../Events';

/**
 * StateManager:
 *
 * Main data store. Responsibilities:
 * - storing main arrays of nodes, links, etc.
 * - storing current state of diagram: selected nodes, selected links etc.
 * - methods for serializing and deserializing data
 * - listening for IO events on event bus and responding accordingly
 */
export class StateManager {
  private eventBus: EventBus;
  private state: DiagramState;

  getState() {
    return {
      ...this.state,
    };
  }

  setCategories(categories: any[]) {
    this.state.categories = categories;
    // ... update the data
  }

  constructor(eventBus: EventBus) {
    this.state = {
      links: [],
      nodes: [],
      categories: [],
      selectedLinks: [],
      selectedNodes: [],
    };

    this.eventBus = eventBus;

    this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.createNode);
    this.eventBus.subscribe(Events.IOEvents.RightMouseClick, this.showNodeContextMenu);
  }

  createNode = (e: any) => {
    this.state.nodes.push({
      name: 'XYZ',
      x: e.x,
      y: e.y,
    });
  }

  showNodeContextMenu() {
    // ... something happened, e.g. node was moved
  }
}