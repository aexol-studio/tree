import * as React from "react";
import { render } from "react-dom";

import { Diagram } from "../src/index";
import { NodeDefinition } from "../src/Models/NodeDefinition";

class App extends React.Component {
  private containerRef = React.createRef<HTMLDivElement>();
  diagram?: Diagram = undefined;
  setupSizes() {
    this.containerRef.current!.style.width = "100%";
    this.containerRef.current!.style.height = "100%";
  }
  componentDidMount() {
    if (!this.containerRef.current) {
      return;
    }
    this.setupSizes();
    this.diagram = new Diagram(this.containerRef.current);
    const createOND = (name: string): NodeDefinition["node"] => ({
      name: `${name}Node`,
      description: `${name} object node`,
      inputs: [],
      outputs: null,
      type: name
    });
    const builtInScalarsNodes = ["string", "ID", "Int", "Float", "Boolean"].map(
      name =>
        ({
          name,
          description: "Scalar node",
          inputs: [],
          outputs: [],
          type: name
        } as NodeDefinition["node"])
    );
    const builtInObjectTypeNodes = ["type", "interface"].map(createOND);
    const builtInObjectInputNodes = ["input"].map(createOND);
    const builtInScalarObjectNodes = ["scalar"].map(
      name =>
        ({
          ...createOND(name),
          inputs: null
        } as NodeDefinition["node"])
    );
    const builtInUnionObjectNodes = ["union"].map(createOND);
    const builtInEnumObjectNodes = ["enum"].map(createOND);
    const builtInScalars: NodeDefinition[] = builtInScalarsNodes.map(
      node =>
        ({
          node,
          acceptsInputs: []
        } as NodeDefinition)
    );
    const builtInTypeObjects: NodeDefinition[] = builtInObjectTypeNodes.map(
      node =>
        ({
          node,
          acceptsInputs: [],
          object: true
        } as NodeDefinition)
    );
    const builtInInputObjects: NodeDefinition[] = builtInObjectInputNodes.map(
      node =>
        ({
          node,
          acceptsInputs: [],
          object: true
        } as NodeDefinition)
    );
    const builtInScalarObjects: NodeDefinition[] = builtInScalarObjectNodes.map(
      node =>
        ({
          node,
          acceptsInputs: undefined,
          object: true
        } as NodeDefinition)
    );
    const builtInUnionObjects: NodeDefinition[] = builtInUnionObjectNodes.map(
      node =>
        ({
          node,
          acceptsInputs: [
            builtInTypeObjects.find(bi => bi.node.type === "type")
          ],
          object: true
        } as NodeDefinition)
    );
    const builtInEnumObjects: NodeDefinition[] = builtInEnumObjectNodes.map(
      node =>
        ({
          node,
          acceptsInputs: [builtInScalars.find(bi => bi.node.type === "string")],
          object: true
        } as NodeDefinition)
    );
    const acceptedArguments = builtInScalars
      .concat(builtInTypeObjects)
      .concat(builtInEnumObjects)
      .concat(builtInScalarObjects)
      .concat(builtInUnionObjects);
    for (const scalar of builtInScalars) {
      scalar.acceptsInputs = [...acceptedArguments];
    }
    for (const object of builtInTypeObjects) {
      object.acceptsInputs = acceptedArguments.concat(builtInInputObjects);
    }
    for (const object of builtInInputObjects) {
      object.acceptsInputs = [...acceptedArguments];
    }

    const nodeDefinitions: NodeDefinition[] = [
      ...builtInScalars,
      ...builtInTypeObjects,
      ...builtInInputObjects,
      ...builtInScalarObjects,
      ...builtInEnumObjects,
      ...builtInUnionObjects
    ];
    this.diagram!.setDefinitions(nodeDefinitions);
  }
  render() {
    return <div ref={this.containerRef} />;
  }
}

render(<App />, document.getElementById("root"));
