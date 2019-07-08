import { EventBus } from "../../../EventBus";
import { DiagramState } from "../../../Models/DiagramState";
import * as Events from "../../../Events";
import { SnapshotType, Snapshot } from "../../../Models/Snapshot";

/**
 * Changes manager:
 *
 * Changes data store.
 */
export class ChangesManager {
  past: Snapshot[] = [
    {
      nodes: [],
      links: []
    }
  ];
  future: Snapshot[] = [];
  constructor(private state: DiagramState, private eventBus: EventBus) {
    this.eventBus.subscribe(
      Events.DiagramEvents.DescriptionRenameEnded,
      this.dataChange
    );
    this.eventBus.subscribe(Events.DiagramEvents.NodeCreated, this.dataChange);
    this.eventBus.subscribe(Events.DiagramEvents.NodeDeleted, this.dataChange);
    this.eventBus.subscribe(Events.DiagramEvents.NodeChanged, this.dataChange);
    this.eventBus.subscribe(Events.DiagramEvents.LinkCreated, this.dataChange);
    this.eventBus.subscribe(Events.DiagramEvents.LinkDeleted, this.dataChange);
    this.eventBus.subscribe(Events.DiagramEvents.UndoRequested, this.undo);
    this.eventBus.subscribe(Events.DiagramEvents.RedoRequested, this.redo);
    this.eventBus.subscribe(
      Events.DiagramEvents.SerialisationRequested,
      this.dataChange
    );
    this.eventBus.subscribe(
      Events.DiagramEvents.LinkMoved,
      this.positionChange
    );
    this.eventBus.subscribe(
      Events.DiagramEvents.NodeMoved,
      this.positionChange
    );
  }
  dataChange = () => {
    this.snapshot("past");
    const payload = {
      nodes: this.state.nodes,
      links: this.state.links
    };
    this.eventBus.publish(Events.DiagramEvents.DataModelChanged, payload);
    this.state.serialisationFunction(payload);
  };
  positionChange = () => {
    const payload = {
      nodes: this.state.nodes,
      links: this.state.links
    };
    this.eventBus.publish(Events.DiagramEvents.DataModelChanged, payload);

    // todo: deprecate this
    this.state.positionSerialisationFunction(payload);
  };
  unsnap = (time: SnapshotType) => {
    const state = this[time].pop()!;
    this.snapshot(time === "past" ? "future" : "past");
    this.state.nodes = [...state.nodes];
    this.state.links = [...state.links];
    this.eventBus.publish(Events.DiagramEvents.RebuildTreeRequested);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    this.eventBus.publish(Events.DiagramEvents.SerialisationRequested);
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
      links: [...this.state.links]
    });
  };
}
