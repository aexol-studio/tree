import * as React from "react";
import { render } from "react-dom";

import { Diagram } from "../src/index";
import { NodeDefinition } from "../src/Models/NodeDefinition";
import { help } from "./help";

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
      outputs: null
    });
    const builtInScalars = ["String", "ID", "Int", "Float", "Boolean"].map(
      name =>
        ({
          node: { ...createOND(name), outputs: [] },
          description: "Scalar node",
          help: help[name],
          type: name,
          acceptsInputs: []
        } as NodeDefinition)
    );
    const builtInTypeObjects: NodeDefinition[] = ["type", "interface"].map(
      name =>
        ({
          node: createOND(name),
          type: name,
          acceptsInputs: [],
          help: help[name],
          object: true
        } as NodeDefinition)
    );
    const builtInInputObjects: NodeDefinition[] = ["input"].map(
      name =>
        ({
          node: createOND(name),
          type: name,
          acceptsInputs: [],
          help: help[name],
          object: true
        } as NodeDefinition)
    );
    const builtInScalarObjects: NodeDefinition[] = ["scalar"].map(
      name =>
        ({
          node: { ...createOND(name), inputs: undefined },
          type: name,
          help: help[name],
          object: true,
          acceptsInputs: undefined
        } as NodeDefinition)
    );
    const builtInUnionObjects: NodeDefinition[] = ["union"].map(
      name =>
        ({
          node: createOND(name),
          type: name,
          help: help[name],
          object: true,
          acceptsInputs: [builtInTypeObjects.find(bi => bi.type === "type")]
        } as NodeDefinition)
    );
    const builtInEnumObjects: NodeDefinition[] = ["enum"].map(
      name =>
        ({
          node: createOND(name),
          type: name,
          help: help[name],
          object: true,
          acceptsInputs: [builtInScalars.find(bi => bi.type === "String")]
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
    for (const object of builtInScalarObjects) {
      object.instanceAcceptsInputs = [...acceptedArguments];
    }
    for (const object of builtInEnumObjects) {
      object.instanceAcceptsInputs = [...acceptedArguments];
    }
    for (const object of builtInUnionObjects) {
      object.instanceAcceptsInputs = [...acceptedArguments];
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
