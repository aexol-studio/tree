import { EventBus } from "../../../EventBus";
import { DiagramState } from "../../../Models/DiagramState";
import * as Events from "../../../Events";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import { DiagramTheme, Node } from "../../../Models";
import { Utils } from "../../../Utils";
import { Renamer } from "../../../IO/Renamer";
import { NodeDefinition } from "../../../Models/NodeDefinition";

/**
 * NodeManager:
 *
 * Main nodes operation class
 */
export class NodeManager {
  private renamer = new Renamer();
  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    private theme: DiagramTheme
  ) {
    this.eventBus.subscribe(
      Events.IOEvents.ScreenLeftMouseClick,
      this.selectNode
    );
    this.eventBus.subscribe(
      Events.IOEvents.ScreenDoubleClick,
      this.graphSelect
    );
    this.eventBus.subscribe(
      Events.IOEvents.ScreenRightMouseUp,
      this.openNodeMenu
    );
  }
  definition = <T extends Pick<Node, "type">>(n: T) =>
    this.state.nodeDefinitions.find(nd => nd.node.type === n.type);

  moveNodes = (e: ScreenPosition) => {
    const { selectedNodes } = this.state;

    if (!selectedNodes.length) {
      return;
    }

    this.state.uiState.draggingWorld = true;

    for (const n of selectedNodes) {
      n.x += e.x - this.state.uiState!.lastDragPosition!.x;
      n.y += e.y - this.state.uiState!.lastDragPosition!.y;
    }
    this.state.uiState!.lastDragPosition = { ...e };
    this.eventBus.publish(Events.DiagramEvents.NodeMoved);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };

  openNodeMenu = (e: ScreenPosition) => {
    if (this.state.draw) {
      return;
    }
    const { node } = this.state.hover;
    if (node) {
      this.state.categories = [
        {
          name: "delete",
          action: () => {
            this.deleteNodes([node]);
          }
        },
        {
          name: "rename",
          action: () => {
            this.state.selectedNodes = [node];
            this.state.renamed = {
              node
            };
            this.renamer.rename(node.name, e => {
              const objectNodeDefinition = this.state.nodeDefinitions.find(
                nd => !!(nd.parent && nd.node.type === node.name)
              );
              node.name = e;

              if (objectNodeDefinition) {
                for (const stateNode of this.state.nodes) {
                  console.log(stateNode);
                  if (stateNode.definition === objectNodeDefinition) {
                    console.log("OK");
                    stateNode.type = e;
                  }
                }
                objectNodeDefinition.node.name = e;
                objectNodeDefinition.node.type = e;
              }
              this.eventBus.publish(Events.DiagramEvents.RenderRequested);
            });
          }
        },
        {
          name: "renameDescription",
          action: () => {
            this.state.selectedNodes = [node];
            this.state.renamed = {
              node,
              description: true
            };
            this.renamer.rename(node.description, e => {
              node.description = e;
              this.eventBus.publish(Events.DiagramEvents.RenderRequested);
            });
          }
        }
      ];
      this.state.menu = {
        position: { ...e }
      };
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
  graphSelect = (e: ScreenPosition) => {
    const { node, io } = this.state.hover;
    if (node && !io) {
      const nodeGraph = Utils.graphFromNode(node);
      this.state.selectedNodes = nodeGraph.nodes;
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
  selectNode = (e: ScreenPosition) => {
    const { node, io } = this.state.hover;
    if (node && !io) {
      if (e.shiftKey) {
        const hasIndex = this.state.selectedNodes.indexOf(node);
        if (hasIndex !== -1) {
          this.state.selectedNodes.splice(hasIndex);
          return;
        }
        this.state.selectedNodes.push(node);
      } else {
        if (
          this.state.selectedNodes.length === 1 ||
          this.state.selectedNodes.indexOf(node) === -1
        ) {
          this.state.selectedNodes = [node];
        }
      }
    } else {
      this.state.selectedNodes = [];
    }
    this.eventBus.publish(Events.DiagramEvents.NodeSelected);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  placeConnectedNode = (node: Node, io: "i" | "o") => {
    let x = node.x,
      y = node.y - this.theme.node.height * 2;
    const xAdd =
      this.theme.node.width + this.theme.port.width + this.theme.node.spacing.x;
    if (io === "i") {
      for (const input of node.inputs!) {
        y = input.y > y ? input.y : y;
      }
      x -= xAdd;
    }
    if (io === "o") {
      for (const output of node.outputs!) {
        y = output.y > y ? output.y : y;
      }
      x += this.theme.node.width + xAdd;
    }
    y += this.theme.node.height + this.theme.node.spacing.y;
    const tooClose = this.state.nodes.filter(
      n =>
        Math.abs(n.y - y) < this.theme.node.height &&
        Math.abs(n.x - x) < this.theme.node.width
    );
    if (tooClose.length) {
      y = Math.max(...tooClose.map(tc => tc.y));
      y += this.theme.node.height + this.theme.node.spacing.y;
    }
    return { x, y };
  };
  deleteNodes = (nodes: Node[]) => {
    const n = nodes.filter(node => !node.readonly);
    this.state.selectedNodes = this.state.selectedNodes.filter(
      node => !n.find(nn => nn === node)
    );
    this.state.nodes = this.state.nodes.filter(
      node => !n.find(nn => nn === node)
    );
    this.state.links = this.state.links.filter(
      link => !n.find(nn => nn === link.i || nn === link.o)
    );
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  createNode = (e: ScreenPosition, n?: Partial<Node> & Pick<Node, "type">) => {
    const createdNode: Node = {
      name: "Person",
      id: Utils.generateId(),
      type: "type",
      description: "Enter your description",
      x: e.x - this.theme.node.width / 2.0,
      y: e.y - this.theme.node.height / 2.0,
      inputs: [],
      outputs: [],
      ...n
    };
    console.log(n);
    if (n) {
      const nodeDefinition = this.definition(n);
      if (nodeDefinition && nodeDefinition.object) {
        if (!n.definition) {
          createdNode.definition = nodeDefinition;
        }
        const ObjectInstanceDefinition = this.state.nodeDefinitions.find(
          nd => nd.node.type === n.name && !nd.object
        );
        if (!ObjectInstanceDefinition) {
          const newDefinition: NodeDefinition = {
            ...nodeDefinition,
            object: undefined,
            main: undefined,
            parent: nodeDefinition,
            node: {
              ...nodeDefinition.node,
              inputs: [],
              outputs: [],
              type: n.name!
            }
          };
          newDefinition.node.definition = newDefinition;
          this.state.nodeDefinitions.push(newDefinition);
        }
      }
    }
    this.state.nodes.push(createdNode);
    this.eventBus.publish(Events.DiagramEvents.NodeCreated);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    return createdNode;
  };
}
