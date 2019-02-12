import { EventBus } from "../../../EventBus";
import { DiagramState } from "../../../Models/DiagramState";
import * as Events from "../../../Events";

/**
 * Changes manager:
 *
 * Changes data store.
 */
export class ChangesManager {
  constructor(private state: DiagramState, private eventBus: EventBus) {
    this.eventBus.subscribe(Events.DiagramEvents.NodeCreated, this.dataChange);
    this.eventBus.subscribe(Events.DiagramEvents.NodeDeleted, this.dataChange);
    this.eventBus.subscribe(Events.DiagramEvents.NodeChanged, this.dataChange);
    this.eventBus.subscribe(Events.DiagramEvents.LinkCreated, this.dataChange);
    this.eventBus.subscribe(Events.DiagramEvents.LinkDeleted, this.dataChange);
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
  dataChange = () =>
    this.state.serialisationFunction({
      nodes: this.state.nodes,
      links: this.state.links
    });
  positionChange = () =>
    this.state.positionSerialisationFunction({
      nodes: this.state.nodes,
      links: this.state.links
    });
}
