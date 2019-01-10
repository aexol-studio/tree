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
    const nodeDefinitions: NodeDefinition[] = [
      {
        object: true,
        node: {
          type: "type",
          outputs: null
        },
        acceptsInputs: [
          {
            type: "string"
          }
        ]
      },
      {
        object: true,
        node: {
          type: "input",
          outputs: null
        },
        acceptsInputs: [
          {
            type: "string"
          }
        ]
      },
      {
        object: true,
        node: {
          type: "scalar",
          outputs: null,
          inputs: null
        },
        acceptsInputs: []
      },
      {
        node: {
          type: "string"
        },
        acceptsInputs: [
          {
            type: "string"
          }
        ]
      }
    ];
    this.diagram!.setDefinitions(nodeDefinitions);
  }
  render() {
    return <div ref={this.containerRef} />;
  }
}

render(<App />, document.getElementById("root"));
