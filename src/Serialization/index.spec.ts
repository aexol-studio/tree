import { expect } from "chai";
import "mocha";
import { NodeDefinition } from "../Models/NodeDefinition";
import { Utils } from "../Utils/index";
import { Node } from "../Models/Node";
import { Link } from "../Models/Link";
import { Serializer } from "./index";

// TODO: This test case should be improved to test more complicated schemas

describe("Serialize and Deserialize", () => {
  it("should serialize and deserialize", () => {
    const nodeDefinitions: NodeDefinition[] = [
      {
        id: Utils.generateId(),
        type: "dummy",
        node: {
          name: "dummy"
        }
      }
    ];
    nodeDefinitions[0].acceptsInputs = [nodeDefinitions[0]];
    const nodes: Node[] = [
      {
        definition: nodeDefinitions[0],
        name: "dummy",
        id: Utils.generateId(),
        options: ["required"],
        x: 0,
        y: 0,
        description: "Hello world",
        editsDefinition: undefined,
        readonly: undefined
      },
      {
        definition: nodeDefinitions[0],
        name: "dummy",
        id: Utils.generateId(),
        options: ["required"],
        x: 0,
        y: 0,
        description: "Hello world 2",
        editsDefinition: undefined,
        readonly: undefined
      }
    ];
    const links: Link[] = [
      {
        centerPoint: 0.5,
        i: nodes[0],
        o: nodes[1]
      }
    ];
    const serialized = Serializer.serialize({
      nodes,
      links
    });
    const deserialize = Serializer.deserialize(serialized, nodeDefinitions);
    expect(JSON.stringify(serialized)).equal(
      JSON.stringify(Serializer.serialize(deserialize))
    );
  });
});
