import { Diagram } from "../src/index";

class App {
  diagram?: Diagram = undefined;
  constructor() {
    const root = document.getElementById("root");
    if (!root) {
      throw new Error("No root html element");
    }
    this.diagram = new Diagram(root, {});
    this.diagram.setNodes([
      {
        id: "123",
        name: "Hello",
        type: "type",
        options: [],
        inputs: ["1", "2", "3", "4"],
      },
      {
        id: "1",
        name: "Hello1",
        type: "type",
        options: [],
        outputs: ["123"],
      },
      {
        id: "2",
        name: "Hello2",
        type: "type",
        options: [],
        outputs: ["123"],
        inputs: ["21"],
      },
      {
        id: "3",
        name: "Hello3",
        type: "type",
        options: [],
        outputs: ["123"],
        inputs: ["31", "32", "33"],
      },
      {
        id: "4",
        name: "Hello4",
        type: "type",
        options: [],
        outputs: ["123"],
        inputs: ["41", "42"],
      },
      {
        id: "41",
        name: "Hello41",
        type: "type",
        options: [],
        outputs: ["4"],
      },
      {
        id: "42",
        name: "Hello42",
        type: "type",
        options: [],
        outputs: ["4"],
      },
      {
        id: "31",
        name: "Hello31",
        type: "type",
        options: [],
        outputs: ["3"],
      },
      {
        id: "32",
        name: "Hello32",
        type: "type",
        options: [],
        outputs: ["3"],
      },
      {
        id: "33",
        name: "Hello33",
        type: "type",
        options: [],
        outputs: ["3"],
      },
      {
        id: "21",
        name: "Hello21",
        type: "Hello",
        options: [],
        outputs: ["2"],
      },
    ]);
  }
}
new App();
