import { NodeDefinition } from "@models";
import { Utils } from "@utils";
import { Node } from "@models";
import { Link } from "@models";
import { Serializer } from "./index";
import { ConfigurationManager } from "@configuration";

// TODO Due to current realization of ConfigurationManager test will fail (singleton instance is undefined).
// TODO So we force creating instance.
new ConfigurationManager({});
describe("Serialize and Deserialize", () => {
  it("should serialize and deserialize", () => {
    const nodeDefinitions: NodeDefinition[] = [
      {
        id: Utils.generateId(),
        type: "dummy",
        node: {
          name: "dummy",
        },
      },
      {
        id: Utils.generateId(),
        type: "type",
        root: true,
        node: {
          name: "dummy",
        },
      },
    ];
    nodeDefinitions[0].acceptsInputs = (allDefinitions) => [
      { definition: nodeDefinitions[0] },
    ];
    nodeDefinitions.push({
      id: Utils.generateId(),
      type: "Person",
      parent: nodeDefinitions[1],
      node: {
        name: "Person",
        inputs: [],
        outputs: [],
      },
    });
    const nodes: Node[] = [
      {
        definition: nodeDefinitions[0],
        name: "dummy",
        id: Utils.generateId(),
        options: ["required"],
        x: 0,
        y: 0,
        description: "Hello world",
        editsDefinitions: undefined,
        readonly: undefined,
      },
      {
        definition: nodeDefinitions[0],
        name: "dummy",
        id: Utils.generateId(),
        options: ["required"],
        x: 0,
        y: 0,
        description: "Hello world 2",
        editsDefinitions: undefined,
        readonly: undefined,
      },
      {
        name: "Person",
        id: Utils.generateId(),
        options: ["required"],
        x: 0,
        y: 0,
        description: "Hello world 2",
        definition: nodeDefinitions[1],
        editsDefinitions: [nodeDefinitions[2]],
        readonly: undefined,
      },
    ];
    const links: Link[] = [
      {
        centerPoint: 0.5,
        i: nodes[0],
        o: nodes[1],
      },
    ];
    const serialized = Serializer.serialize({
      nodes,
      links,
    });
    const deserialize = Serializer.deserialize(serialized, nodeDefinitions);
    console.log(JSON.stringify(serialized, null, 4));
    expect(JSON.stringify(serialized)).toEqual(
      JSON.stringify(Serializer.serialize(deserialize))
    );
  });
});
