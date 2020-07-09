import { EventBus } from "@eventBus";
import { SnapshotType, Snapshot, DiagramState } from "@models";

/**
 * Changes manager:
 *
 * Changes data store.
 */
export class ChangesManager {
  past: Snapshot[] = [
    {
      nodes: [],
      links: [],
    },
  ];
  future: Snapshot[] = [];
  constructor(private state: DiagramState, private eventBus: EventBus) {
    this.eventBus.subscribe("DescriptionRenameEnded", this.dataChange);
    this.eventBus.subscribe("NodeCreated", this.dataChange);
    this.eventBus.subscribe("NodeDeleted", this.dataChange);
    this.eventBus.subscribe("NodeChanged", this.dataChange);
    this.eventBus.subscribe("LinkCreated", this.dataChange);
    this.eventBus.subscribe("LinksDeleted", this.dataChange);
    this.eventBus.subscribe("UndoRequested", this.undo);
    this.eventBus.subscribe("RedoRequested", this.redo);
    this.eventBus.subscribe("SerialisationRequested", this.dataChange);
    this.eventBus.subscribe("LinkMoved", this.positionChange);
    this.eventBus.subscribe("NodeMoved", this.positionChange);
  }
  dataChange = () => {
    this.snapshot("past");
    const payload = {
      nodes: this.state.nodes,
      links: this.state.links,
    };
    this.eventBus.publish("DataModelChanged", payload);
  };
  positionChange = () => {
    const payload = {
      nodes: this.state.nodes,
      links: this.state.links,
    };
    this.eventBus.publish("DataModelChanged", payload);
  };
  unsnap = (time: SnapshotType) => {
    const state = this[time].pop();
    if (!state) {
      throw new Error("Cannot make undo snapshot");
    }
    this.snapshot(time === "past" ? "future" : "past");
    this.state.nodes = [...state.nodes];
    this.state.links = [...state.links];
    this.eventBus.publish("RebuildTreeRequested");
    this.eventBus.publish("RenderRequested");
    this.eventBus.publish("SerialisationRequested");
  };
  undo = () => {
    if (this.past.length > 1) {
      this.past.pop();
      this.unsnap("past");
    }
  };
  redo = () => {
    if (this.future.length > 0) {
      this.unsnap("future");
    }
  };
  snapshot = (time: SnapshotType, clear?: SnapshotType) => {
    if (clear) {
      delete this[clear];
      this[clear] = [];
    }
    if (this[time].length > 50) {
      this[time].shift();
    }
    this[time].push({
      nodes: [...this.state.nodes],
      links: [...this.state.links],
    });
  };
}
