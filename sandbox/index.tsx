import { Diagram } from "../src/index";
import {
  NodeDefinition,
  AcceptedNodeDefinition
} from "../src/Models/NodeDefinition";
import { NodeOption } from "../src/Models/NodeOption";
import { DefaultDiagramThemeLight } from "../src/Theme/DefaultDiagramThemeLight";

class App {
  diagram?: Diagram = undefined;
  constructor() {
    this.diagram = new Diagram(document.getElementById("root")!, {
      disableLinkOperations: true,
      theme: DefaultDiagramThemeLight
    });
    const createOND = (name: string): NodeDefinition["node"] => ({
      name: `${name}`,
      description: ``,
      inputs: [],
      outputs: []
    });
    const options: NodeOption[] = [
      {
        name: "required",
        help:
          "Check this if this node is required for creation of the type or is required in input | interface"
      },
      {
        name: "array",
        help:
          "Check this if you want a list here for example 'Hello' is a String however ['Hello', 'Me', 'World', 'Sloth'] its an array of strings"
      }
    ];
    this.diagram!.setDefinitions([
      {
        type: "www",
        help: "Hello I am dummy node this is help I do display",
        node: createOND(""),
        options,
        root: true,
        instances: [{}],
        acceptsInputs: (d, defs) =>
          defs.map(
            def =>
              ({
                definition: def
              } as AcceptedNodeDefinition)
          ),
        acceptsOutputs: (d, defs) =>
          defs.map(
            def =>
              ({
                definition: def
              } as AcceptedNodeDefinition)
          )
      },
      {
        type: "dummy",
        help: "Hello I am dummy node this is help I do display",
        node: {
          ...createOND("dummy"),
          notEditable: true
        },
        options,
        root: true,
        acceptsInputs: (d, defs) =>
          defs.map(
            def =>
              ({
                definition: def
              } as AcceptedNodeDefinition)
          ),
        acceptsOutputs: (d, defs) =>
          defs.map(
            def =>
              ({
                definition: def
              } as AcceptedNodeDefinition)
          )
      }
    ]);
  }
}
new App();
