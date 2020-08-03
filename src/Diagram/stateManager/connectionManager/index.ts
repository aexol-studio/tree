import { EventBus } from "@eventBus";
import { DiagramState } from "@models";
import { Node, Link, DiagramTheme } from "@models";
import { NodeUtils } from "@utils";

/**
 * ConnectionManager:
 *
 * Connection Manager is for connections:
 */
export class ConnectionManager {
  constructor(
    private eventBus: EventBus,
    private state: DiagramState,
    private theme: DiagramTheme,
    private connectionFunction: (input: Node, output: Node) => boolean
  ) {
    this.eventBus.subscribe("NodeDeleted", this.onNodesDelete);
  }
  loadLinks = (links: Link[]) => {
    this.state.links = links;
  };
  onNodesDelete = ({ nodes }: { nodes: Node[] }) => {
    this.deleteLinks(
      this.state.links.filter((l) => nodes.find((n) => n === l.i || n === l.o))
    );
  };
  deleteLinks = (links: Link[]) => {
    this.state.links = this.state.links.filter(
      (l) => !links.find((lf) => lf === l)
    );
    links.forEach((l) => {
      l.o.outputs = l.o.outputs?.filter((o) => o !== l.i);
      l.i.inputs = l.i.inputs?.filter((i) => i !== l.o);
    });
    this.eventBus.publish("RenderRequested");
    this.eventBus.publish("LinksDeleted", { links });
  };
  makeConnection = (i: Node, o: Node) => {
    const linkExists = () =>
      !!this.state.links.find((l) => l.i === i && l.o === o);
    const correctType = () => {
      const acceptsInputs = NodeUtils.getDefinitionAcceptedInputs(
        i.definition,
        this.state.nodeDefinitions,
        o.definition,
        this.state.nodes,
        i
      );
      if (!acceptsInputs) {
        return false;
      }
      for (const ai of acceptsInputs) {
        if (ai.type === o.definition.type) {
          return true;
        }
        if (o.definition.parent) {
          if (ai.type === o.definition.parent.type) {
            return true;
          }
        }
      }
      return false;
    };
    if (!this.connectionFunction(i, o) || linkExists() || !correctType()) {
      this.eventBus.publish("RenderRequested");
      return;
    }
    const newLink: Link = {
      o: o,
      i: i,
      centerPoint: this.theme.link.defaultCenterPoint,
      circularReference: i.id === o.id,
    };
    this.state.links.push(newLink);
    if (!i.inputs || !o.outputs) {
      throw new Error("Cannot make a connection");
    }
    i.inputs.push(o);
    o.outputs.push(i);
    this.eventBus.publish("LinkCreated", { link: newLink });
    return newLink;
  };
}
