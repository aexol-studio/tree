import { Diagram } from "../src/index";

class App {
  diagram?: Diagram = undefined;
  constructor() {
    const root = document.getElementById("root");
    if (!root) {
      throw new Error("No root html element");
    }
    this.diagram = new Diagram(root, {});
    this.diagram.setNodes(require("./definitions.json"));
  }
}
new App();
