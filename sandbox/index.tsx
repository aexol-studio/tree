import * as React from "react";
import { render } from "react-dom";

import { Diagram } from "../src/index";
import { NodeDefinition } from "../src/Models/NodeDefinition";
import { Node } from "../src/Models";

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
        } as Node)
    );
    const builtInObjectNodes = ["type", "interface", "input"].map(
      name =>
        ({
          name,
          description: "Object node",
          inputs: [],
          type: name
        } as Node)
    );
    const builtInScalars: NodeDefinition[] = builtInScalarsNodes.map(
      node =>
        ({
          node,
          acceptsInputs: builtInScalarsNodes
        } as NodeDefinition)
    );
    const builtInObjects: NodeDefinition[] = builtInObjectNodes.map(
      node =>
        ({
          node,
          acceptsInputs: [...builtInObjectNodes,...builtInScalarsNodes],
          object:true
        } as NodeDefinition)
    );

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
