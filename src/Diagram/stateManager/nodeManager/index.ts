import { EventBus } from "../../../EventBus";
import { DiagramState } from "../../../Models/DiagramState";
import * as Events from "../../../Events";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import { DiagramTheme, Node, NodeDefinition } from "../../../Models";
import { NodeUtils } from "../../../Utils/nodeUtils";
import { QuadTree } from "../../../QuadTree";
import { UIManager } from "../uiManager/index";

/**
 * NodeManager:
 *
 * Main nodes operation class
 */
export class NodeManager {
  private storeSelectedNodesRelativePosition: ScreenPosition[] = [];
  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    private uiManager: UIManager,
    private theme: DiagramTheme
  ) {
    this.eventBus.subscribe(
      Events.IOEvents.WorldLeftMouseClick,
      this.selectNode
    );
    this.eventBus.subscribe(
      Events.IOEvents.WorldLeftMouseClick,
      this.goToNodeType
    );
    this.eventBus.subscribe(
      Events.IOEvents.ScreenDoubleClick,
      this.nodeIsRenamed
    );
    this.eventBus.subscribe(
      Events.IOEvents.ScreenRightMouseUp,
      this.openNodeMenu
    );
    this.eventBus.subscribe(
      Events.IOEvents.ScreenMouseLeave,
      this.handleScreenLeave
    );
    this.eventBus.subscribe(Events.IOEvents.WorldMouseDragEnd, this.movedNodes);
    this.eventBus.subscribe(
      Events.DiagramEvents.NodeRenameEnded,
      this.nodeRenameEnded
    );
    this.eventBus.subscribe(Events.DiagramEvents.NodeSelected, this.storeNodes);
    this.eventBus.subscribe(Events.IOEvents.BackspacePressed, this.deleteSelectedNodes);
  }
  handleScreenLeave = () => {
    if (this.state.uiState.draggingElements) {
      this.state.uiState.draggingElements = false;
      this.movedNodes();
    }
  };
  rebuildTree = () => {
    this.state.trees.node = new QuadTree<Node>();
    this.state.nodes.forEach(n =>
      this.state.trees.node.insert(NodeUtils.createTreeNode(n, this.theme))
    );
  };
  loadNodes = (nodes: Node[]) => {
    this.state.nodes = nodes;
    this.state.selectedNodes = [];
    this.rebuildTree();
  };
  storeNodes = (e: ScreenPosition) => {
    this.storeSelectedNodesRelativePosition = this.state.selectedNodes.map(
      sn =>
        ({
          x: e.x - sn.x,
          y: e.y - sn.y
        } as ScreenPosition)
    );
  };
  moveNodes = (e: ScreenPosition) => {
    if (this.state.isReadOnly) return;
    if (this.state.renamed) return;
    const { selectedNodes } = this.state;
    if (!selectedNodes.length) {
      return;
    }
    this.state.uiState.draggingElements = true;
    for (let i = 0; i < selectedNodes.length; i++) {
      const n = selectedNodes[i];
      const oldN = this.storeSelectedNodesRelativePosition[i];
      n.x = e.x - oldN.x;
      n.y = e.y - oldN.y;
    }
    this.state.uiState!.lastDragPosition = { ...e };
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  movedNodes = () => {
    const { selectedNodes } = this.state;
    if (!selectedNodes.length) {
      return;
    }
    this.rebuildTree();
    this.eventBus.publish(Events.DiagramEvents.NodeMoved, selectedNodes);
  };
  descriptionIsRenamed = (node: Node) => {
    if (node) {
      const nodePosition = this.uiManager.worldToScreen({
        x: node.x,
        y: node.y
      });
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
      this.eventBus.publish(
        Events.DiagramEvents.DescriptionRenameShowInput,
        node,
        nodePosition
      );
      if (this.state.isReadOnly) {
        this.eventBus.publish(Events.DiagramEvents.DescriptionMakeReadOnly);
      }
      if (!this.state.isReadOnly) {
        this.eventBus.publish(Events.DiagramEvents.DescriptionMakeEditable);
      }
    }
  };
  nodeIsRenamed = () => {
    const [node] = this.state.selectedNodes;
    if (node && !this.state.isReadOnly) {
      const nodePosition = this.uiManager.worldToScreen({
        x: node.x,
        y: node.y
      });
      this.state.renamed = node;
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
      this.eventBus.publish(
        Events.DiagramEvents.NodeRenameShowInput,
        node.name,
        nodePosition
      );
    }
  };
  nodeRenameEnded = (newName: string) => {
    this.renameNode(this.state.renamed!, newName);
    delete this.state.renamed;
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  renameNode = (node: Node, name: string) => {
    if (this.state.isReadOnly || node.notEditable || node.readonly) {
      return;
    }
    node.name = name;
    if (node.editsDefinitions) {
      node.editsDefinitions.forEach(ed => (ed.type = name));
    }
    this.eventBus.publish(Events.DiagramEvents.NodeChanged);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  beautifyNodesInPlace = (node: Node) => {
    const graph = NodeUtils.graphFromNode(node);
    const {
      center: { x, y }
    } = graph;
    const graph2 = NodeUtils.positionGraph(graph, this.theme);
    const diff = {
      x: x - graph2.center.x,
      y: y - graph2.center.y
    };
    graph2.nodes.forEach(n => {
      n.x += diff.x;
      n.y += diff.y;
    });
    this.eventBus.publish(Events.DiagramEvents.RebuildTreeRequested);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  deleteSelectedNodes = () => {
    this.deleteNodes(this.state.selectedNodes);
  }
  openNodeMenu = (e: ScreenPosition) => {
    if (this.state.isReadOnly || this.state.draw) {
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
            if (this.state.selectedNodes.indexOf(node) > -1) {
              this.deleteSelectedNodes();
            } else {
              this.deleteNodes([node]);
            }
          }
        },
        {
          name: "beautify graph",
          help: "Beautify graph and put nodes in good positions",
          action: () => {
            this.beautifyNodesInPlace(node);
          }
        }
      ];
      const definitionHasOptions = node.definition.options;
      if (definitionHasOptions) {
        this.state.categories = this.state.categories.concat(
          definitionHasOptions.map(({ help, name }) => ({
            name,
            help,
            action: () => {
              const hasIndex = node.options.findIndex(n => n === name);
              if (hasIndex !== -1) {
                node.options.splice(hasIndex, 1);
                this.eventBus.publish(Events.DiagramEvents.NodeChanged);
                return;
              }
              node.options.push(name);
              this.eventBus.publish(Events.DiagramEvents.NodeChanged);
            }
          }))
        );
      }

      const categories =
        node.definition.categories ||
        (node.definition.parent && node.definition.parent.categories);
      if (categories && categories.node) {
        this.state.categories = this.state.categories.concat(categories.node);
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
  selectSingleNode = (node: Node) => {
    this.state.selectedNodes = [node];
    this.descriptionIsRenamed(node);
  };
  goToNodeType = (e: ScreenPosition) => {
    const { type, node } = this.state.hover;
    if (type && node && node.definition.parent) {
      const parentNode = this.state.nodes.find(
        n =>
          !!n.editsDefinitions &&
          !!n.editsDefinitions.find(e => e === node.definition)
      );
      if (parentNode) {
        this.selectSingleNode(parentNode);
        this.eventBus.publish(Events.DiagramEvents.NodeSelected, {
          x: parentNode.x,
          y: parentNode.y
        });
        this.eventBus.publish(Events.DiagramEvents.CenterPanRequested, {
          x: parentNode.x,
          y: parentNode.y
        });
      }
    }
  };
  selectNode = (e: ScreenPosition) => {
    const { node, io, type } = this.state.hover;
    if (node && !io && !type) {
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
          this.selectSingleNode(node);
        }
      }
    } else {
      this.state.selectedNodes = [];
    }
    this.eventBus.publish(Events.DiagramEvents.NodeSelected, e);
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
    const editsDefinitions = n
      .filter(n => n.editsDefinitions)
      .map(n => n.editsDefinitions!)
      .reduce((a, b) => a.concat(b), []);
    n = n.concat(
      this.state.nodes.filter(node =>
        editsDefinitions.find(e => e === node.definition)
      )
    );
    this.state.nodeDefinitions = this.state.nodeDefinitions.filter(
      n => !editsDefinitions.find(o => o === n)
    );
    this.state.selectedNodes = this.state.selectedNodes.filter(
      node => !n.find(nn => nn === node)
    );
    this.state.nodes = this.state.nodes.filter(
      node => !n.find(nn => nn === node)
    );
    this.rebuildTree();
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
    this.selectSingleNode(createdNode);
    this.eventBus.publish(Events.DiagramEvents.NodeCreated, createdNode);
    if (!createdNode.name) {
      this.nodeIsRenamed();
    }
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    return createdNode;
  };
  getCenter = () => {
    const X: number[] = [];
    const Y: number[] = [];
    this.state.nodes.forEach(n => X.push(n.x) && Y.push(n.y));
    return {
      x: 0.5 * (Math.max(...X) + Math.min(...X)),
      y: 0.5 * (Math.max(...Y) + Math.min(...Y))
    };
  };
}
