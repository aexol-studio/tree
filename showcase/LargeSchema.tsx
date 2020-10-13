import { Diagram } from "../src/index";
import { Serializer } from "../src/Serialization";
const json = require("./serialized.json");
const definitions = require("./definitions.json");

export class LargeSchema {
  diagram?: Diagram = undefined;
  constructor() {
    const root = document.getElementById("root");
    if (!root) {
      throw new Error("No root html element");
    }
    this.diagram = new Diagram(root, {
      disableLinkOperations: true,
    });
    const links = Serializer.deserialize(json, definitions).links;
    const nodes = Serializer.deserialize(json, definitions).nodes;
    const ioNodes = nodes.map((el) => {
      return {
        ...el,
        outputs:
          links.filter((l) => l.o.id === el.id).map((l) => l.i).length === 0 &&
          el.definition.type === "type"
            ? null
            : links.filter((l) => l.o.id === el.id).map((l) => l.i),
        inputs: links.filter((l) => l.i.id === el.id).map((l) => l.o),
      };
    });
    const ioLinks = links.map((el) => {
      return {
        ...el,
        i: ioNodes.find((n) => n.id === el.i.id),
        o: ioNodes.find((n) => n.id === el.o.id),
      };
    });
    this.diagram.setLinks(ioLinks);
    this.diagram.setNodes(ioNodes);
    this.diagram.zeroDiagram();
  }
}
