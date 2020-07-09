import { Diagram } from "../src/index";
import {
  NodeDefinition,
  AcceptedNodeDefinition,
  NodeOption,
} from "../src/Models";
import { DefaultDiagramTheme } from "../src/Theme/DefaultDiagramTheme";

class App {
  diagram?: Diagram = undefined;
  constructor() {
    const root = document.getElementById("root");
    if (!root) {
      throw new Error("No root html element");
    }
    this.diagram = new Diagram(root, {
      disableLinkOperations: true,
      theme: { ...DefaultDiagramTheme, fontFamily: `"Roboto"` },
    });
    const helper = document.createElement("div");
    helper.innerHTML = "Create first Node";
    helper.style.position = "fixed";
    helper.style.left = "calc(50vw - 100px)";
    helper.style.top = "calc(50vh - 20px)";
    helper.style.width = "200px";
    (helper.style.display = "flex"),
      (helper.style.height = "40px"),
      (helper.style.background = "#153");
    helper.style.color = "#fff";
    helper.style.fontSize = "12px";
    helper.style.alignItems = "center";
    helper.style.justifyContent = "center";
    helper.style.cursor = "pointer";
    helper.onclick = () => {
      this.diagram?.eventBus.publish("MenuCreateNodeRequested", {
        position: {
          x: helper.getBoundingClientRect().x * 2,
          y: helper.getBoundingClientRect().y * 2,
        },
      });
    };
    this.diagram.eventBus.on("NodeCreated", () => helper.remove());
    document.body.appendChild(helper);
    const createOND = (name: string): NodeDefinition["node"] => ({
      name: `${name}`,
      description: ``,
      inputs: [],
      outputs: [],
    });
    const options: NodeOption[] = [
      {
        name: "required",
        help:
          "Check this if this node is required for creation of the type or is required in input | interface",
      },
      {
        name: "array",
        help:
          "Check this if you want a list here for example 'Hello' is a String however ['Hello', 'Me', 'World', 'Sloth'] its an array of strings",
      },
    ];
    this.diagram.setDefinitions([
      {
        type: "www",
        help: "Hello I am dummy node this is help I do display",
        node: createOND(""),
        options,
        root: true,
        instances: [{}],
        acceptsInputs: (d, defs) =>
          defs.map(
            (def) =>
              ({
                definition: def,
              } as AcceptedNodeDefinition)
          ),
        acceptsOutputs: (d, defs) =>
          defs.map(
            (def) =>
              ({
                definition: def,
              } as AcceptedNodeDefinition)
          ),
      },
      {
        type: "dummy",
        help: "Hello I am dummy node this is help I do display",
        node: {
          ...createOND("dummy"),
          notEditable: true,
        },
        options,
        root: true,
        acceptsInputs: (d, defs) =>
          defs.map(
            (def) =>
              ({
                definition: def,
              } as AcceptedNodeDefinition)
          ),
        acceptsOutputs: (d, defs) =>
          defs.map(
            (def) =>
              ({
                definition: def,
              } as AcceptedNodeDefinition)
          ),
      },
    ]);
  }
}
new App();
