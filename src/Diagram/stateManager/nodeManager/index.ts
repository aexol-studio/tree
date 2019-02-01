import { EventBus } from "../../../EventBus";
import { DiagramState } from "../../../Models/DiagramState";
import * as Events from "../../../Events";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import { DiagramTheme, Node, NodeDefinition } from "../../../Models";
import { Renamer } from "../../../IO/Renamer";
import { NodeUtils } from "../../../Utils/nodeUtils";
import { QuadTree } from "../../../QuadTree";

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
    this.eventBus.subscribe(Events.IOEvents.WorldMouseDragEnd, this.movedNodes);
  }
  rebuildTree = () => {
    this.state.trees.node = new QuadTree<Node>();
    this.state.nodes.forEach(n =>
      this.state.trees.node.insert(NodeUtils.createTreeNode(n, this.theme))
    );
  };
  loadNodes = (nodes: Node[]) => {
    this.state.nodes = nodes;
    nodes.forEach(node => {
      this.state.trees.node.insert(NodeUtils.createTreeNode(node, this.theme));
    });
  };
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
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  movedNodes = () => {
    const { selectedNodes } = this.state;
    if (!selectedNodes.length) {
      return;
    }
    for (const node of selectedNodes)
      this.state.trees.node.update(
        node,
        { x: node.x, y: node.y },
        NodeUtils.createTreeNode(node, this.theme).bb
      );
    this.eventBus.publish(Events.DiagramEvents.NodeMoved, selectedNodes);
  };
  renameNode = (node: Node, name: string) => {
    node.name = name;
    if (node.editsDefinition) {
      node.editsDefinition.type = name;
    }
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  openNodeMenu = (e: ScreenPosition) => {
    if (this.state.draw) {
      return;
    }
    const { node } = this.state.hover;
    if (node && !this.state.menu) {
      this.state.categories = [
        {
          name: "delete",
          help:
            "Delete all selected nodes. If you are deleting object definitions it will delete instances of this object also",
          action: () => {
            this.deleteNodes([node]);
          }
        },
        {
          name: "rename",
          help:
            "Rename currently selected node. If you rename definition it will change the type of instances of course",
          action: () => {
            this.state.selectedNodes = [node];
            this.state.renamed = {
              node
            };
            this.renamer.rename(node.name, e => {
              this.renameNode(node, e);
            });
          }
        },
        {
          name: "renameDescription",
          help: "Change selected node description",
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
        },
        {
          name: "beautify graph",
          help: "Beautify graph and put nodes in good positions",
          action: () => {
            const graph = NodeUtils.graphFromNode(node);
            NodeUtils.positionGraph(graph, this.theme);
            const graph2 = NodeUtils.graphFromNode(node);
            const diff = {
              x: graph.center.x - graph2.center.x,
              y: graph.center.y - graph2.center.y
            };
            graph2.nodes.forEach(n => {
              n.x += diff.x;
              n.y += diff.y;
            });
            this.eventBus.publish(Events.DiagramEvents.RebuildTreeRequested);
            this.eventBus.publish(Events.DiagramEvents.RenderRequested);
          }
        }
      ];
      const definitionHasOptions = node.definition.parent
        ? node.definition.instanceOptions
        : node.definition.options;
      if (definitionHasOptions) {
        this.state.categories = this.state.categories.concat(
          definitionHasOptions.map(({ help, name }) => ({
            name,
            help,
            action: () => {
              const hasIndex = node.options.findIndex(n => n === name);
              if (hasIndex !== -1) {
                node.options.splice(hasIndex, 1);
                return;
              }
              node.options.push(name);
            }
          }))
        );
      }
      this.state.menu = {
        position: { ...e }
      };
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
  graphSelect = (e: ScreenPosition) => {
    const { node, io } = this.state.hover;
    if (node && !io) {
      const nodeGraph = NodeUtils.graphFromNode(node);
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
    let n = nodes.filter(node => !node.readonly);
    const definitions = n.map(n => n.definition);
    const objectDefinitions = definitions.filter(d => d.object);
    const editsDefinition = n
      .filter(n => n.editsDefinition)
      .map(n => n.editsDefinition!);
    //TODO: might be optimised
    for (const nodeDefinition of objectDefinitions) {
      n = n.concat(
        this.state.nodes.filter(
          node => node.definition.parent === nodeDefinition
        )
      );
    }
    this.state.nodeDefinitions = this.state.nodeDefinitions.filter(
      n => !editsDefinition.find(o => o === n)
    );
    for (const treeNode of n) {
      this.state.trees.node.delete(treeNode, { x: treeNode.x, y: treeNode.y });
    }
    this.state.selectedNodes = this.state.selectedNodes.filter(
      node => !n.find(nn => nn === node)
    );
    this.state.nodes = this.state.nodes.filter(
      node => !n.find(nn => nn === node)
    );
    this.eventBus.publish(Events.DiagramEvents.NodeDeleted, n);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  createNode = (e: ScreenPosition, nodeDefinition: NodeDefinition) => {
    const createdNode: Node = NodeUtils.createNode(
      e,
      nodeDefinition,
      this.state.nodeDefinitions
    );
    this.state.nodes.push(createdNode);
    this.state.trees.node.insert(
      NodeUtils.createTreeNode(createdNode, this.theme)
    );
    this.eventBus.publish(Events.DiagramEvents.NodeCreated, createdNode);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    return createdNode;
  };
}
