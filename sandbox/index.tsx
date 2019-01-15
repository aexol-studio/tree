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
    const builtInObjectNodes = ["type", "interface", "input"].map(
      name =>
        ({
          name,
          description: "Object node",
          inputs: [],
          outputs: null,
          type: name
        } as NodeDefinition["node"])
    );
    const builtInScalars: NodeDefinition[] = builtInScalarsNodes.map(
      node =>
        ({
          node,
          acceptsInputs: []
        } as NodeDefinition)
    )
    const builtInObjects: NodeDefinition[] = builtInObjectNodes.map(
      node =>
        ({
          node,
          acceptsInputs: [],
          object: true
        } as NodeDefinition)
    );
    for(const scalar of builtInScalars){
      scalar.acceptsInputs = builtInScalars.concat(builtInObjects)
    }
    for(const object of builtInObjects){
      object.acceptsInputs = builtInScalars.concat(builtInObjects)
    }

    const nodeDefinitions: NodeDefinition[] = [
      ...builtInScalars,
      ...builtInObjects
    ];
    this.diagram!.setDefinitions(nodeDefinitions);
  }
  render() {
    return <div ref={this.containerRef} />;
  }
}

render(<App />, document.getElementById("root"));
