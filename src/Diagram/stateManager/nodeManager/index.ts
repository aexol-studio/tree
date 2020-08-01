import { EventBus } from "@eventBus";
import { ScreenPosition } from "@io";
import {
  DiagramState,
  DiagramTheme,
  Node,
  NodeDefinition,
  Category,
  AcceptedNodeDefinition,
} from "@models";
import { NodeUtils } from "@utils";
import { QuadTree } from "@quadTree";
import { UIManager } from "../uiManager/index";
import { ConnectionManager } from "../connectionManager/index";
import { RenameManager } from "../renameManager/index";
import { HtmlManager } from "../htmlManager/index";
import { DescriptionManager } from "../descriptionManager";

/**
 * NodeManager:
 *
 * Main nodes operation class
 */
export class NodeManager {
  private storeSelectedNodesRelativePosition: ScreenPosition[] = [];
  private renameManager: RenameManager;
  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    private uiManager: UIManager,
    private theme: DiagramTheme,
    private connectionManager: ConnectionManager,
    private htmlManager: HtmlManager,
    private descriptionManager: DescriptionManager
  ) {
    this.eventBus.subscribe("WorldLeftMouseClick", this.selectNode);
    this.eventBus.subscribe("WorldLeftMouseClick", this.goToNodeType);
    this.eventBus.subscribe("NodeOpenFieldMenu", this.openPortMenu);
    this.eventBus.subscribe("ScreenRightMouseUp", this.openNodeMenu);
    this.eventBus.subscribe("ScreenMouseLeave", this.handleScreenLeave);
    this.eventBus.subscribe("NodeCreationRequested", this.createNode);
    this.eventBus.subscribe("WorldMouseDragEnd", this.movedNodes);
    this.eventBus.subscribe("NodeSelected", this.storeNodes);
    this.eventBus.subscribe("BackspacePressed", this.deleteSelectedNodes);

    this.renameManager = new RenameManager(
      state,
      this.eventBus,
      this.htmlManager
    );
  }
  handleScreenLeave = () => {
    if (this.state.uiState.draggingElements) {
      this.state.uiState.draggingElements = false;
      this.movedNodes();
    }
  };
  rebuildTree = () => {
    this.state.trees.node = new QuadTree<Node>();
    this.state.nodes
      .filter((n) => !n.hidden)
      .forEach((n) =>
        this.state.trees.node.insert(NodeUtils.createTreeNode(n, this.theme))
      );
  };
  loadNodes = (nodes: Node[]) => {
    this.state.nodes = nodes;
    this.state.selectedNodes = [];
    this.rebuildTree();
  };
  storeNodes = ({ e }: { e: ScreenPosition }) => {
    this.storeSelectedNodesRelativePosition = this.state.selectedNodes.map(
      (sn) =>
        ({
          x: e.x - sn.x,
          y: e.y - sn.y,
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
      if (!oldN) {
        continue;
      }
      n.x = e.x - oldN.x;
      n.y = e.y - oldN.y;
    }
    this.state.uiState.lastDragPosition = { ...e };
    this.eventBus.publish("RenderRequested");
  };
  movedNodes = () => {
    const { selectedNodes } = this.state;
    if (!selectedNodes.length) {
      return;
    }
    this.rebuildTree();
    this.eventBus.publish("NodeMoved", { selectedNodes });
  };
  beautifyNodesInPlace = (node: Node) => {
    const graph = NodeUtils.graphFromNode(node);
    const {
      center: { x, y },
    } = graph;
    const graph2 = NodeUtils.positionGraph(graph, this.theme);
    const diff = {
      x: x - graph2.center.x,
      y: y - graph2.center.y,
    };
    graph2.nodes.forEach((n) => {
      n.x += diff.x;
      n.y += diff.y;
    });
    this.eventBus.publish("RebuildTreeRequested");
    this.eventBus.publish("RenderRequested");
  };
  deleteSelectedNodes = () => {
    this.deleteNodes(this.state.selectedNodes);
  };
  openNodeMenu = ({ position }: { position: ScreenPosition }) => {
    if (this.state.isReadOnly || this.state.draw) {
      return;
    }
    const { node, io } = this.state.hover;
    if (node) {
      const menuCategories: Category[] = [];
      menuCategories.push(
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
          },
        },
        {
          name: "beautify graph",
          help: "Beautify graph and put nodes in good positions",
          action: () => {
            this.beautifyNodesInPlace(node);
          },
        },
        {
          name: "select graph",
          help: "Select all nodes in graph",
          action: () => {
            this.graphSelect();
          },
        },
        {
          name: node.hideChildren ? "unfold" : "fold",
          help: (node.hideChildren ? "unfold" : "fold") + " children in graph",
          action: () => {
            if (!io && node) {
              if (node.hideChildren) {
                this.foldChildren(node, true);
                return;
              }
              this.foldChildren(node);
            }
          },
        }
      );

      const definitionHasOptions = node.definition.options;
      if (definitionHasOptions) {
        menuCategories.push(
          ...definitionHasOptions.map(({ help, name }) => ({
            name,
            help,
            action: () => {
              const hasIndex = node.options.findIndex((n) => n === name);
              if (hasIndex !== -1) {
                node.options.splice(hasIndex, 1);
                this.eventBus.publish("NodeChanged", { node });
                this.eventBus.publish("RenderRequested");
                return;
              }
              node.options.push(name);
              this.eventBus.publish("NodeChanged", { node });
              this.eventBus.publish("RenderRequested");
            },
          }))
        );
      }
      const categories =
        node.definition.categories ||
        (node.definition.parent && node.definition.parent.categories);
      if (categories && categories.node) {
        menuCategories.push(...categories.node);
      }

      this.eventBus.publish("MenuRequested", {
        e: position,
        title: `Edit ${node.name}`,
        categories: menuCategories,
      });
    }
  };
  graphSelect = () => {
    const { node, io } = this.state.hover;
    if (node && !io) {
      const nodeGraph = NodeUtils.graphFromNode(node);
      this.state.selectedNodes = nodeGraph.nodes;
      this.eventBus.publish("RenderRequested");
    }
  };
  foldChildren = (node: Node, unfold?: boolean) => {
    const childrenToFold = NodeUtils.findAllConnectedNodes(node).filter(
      (n) => n !== node
    );
    if (childrenToFold.length > 0) {
      childrenToFold.forEach((child) => {
        child.hidden = !unfold;
      });
      node.hideChildren = !unfold;
    }
    this.eventBus.publish("RebuildTreeRequested");
    this.eventBus.publish("RenderRequested");
  };
  selectSingleNode = (node: Node) => {
    this.state.selectedNodes = [node];
  };
  goToNodeType = () => {
    const { type, node } = this.state.hover;
    if (type && node && node.definition.parent) {
      const parentNode = this.state.nodes.find(
        (n) =>
          !!n.editsDefinitions &&
          !!n.editsDefinitions.find((e) => e === node.definition)
      );
      if (parentNode) {
        this.selectSingleNode(parentNode);
        this.eventBus.publish("CenterOnNode", { node: parentNode });
      }
    }
  };
  selectNode = ({ position }: { position: ScreenPosition }) => {
    const { node, io, type } = this.state.hover;
    if (node && !io && !type) {
      if (position.shiftKey) {
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
    this.eventBus.publish("NodeSelected", {
      e: position,
      selectedNodes: [...this.state.selectedNodes],
    });
    this.eventBus.publish("RenderRequested");
  };
  placeConnectedNode = (node: Node, io: "i" | "o") => {
    let x = node.x,
      y = node.y - this.theme.node.height * 2;
    const xAdd =
      this.theme.node.width + this.theme.port.width + this.theme.node.spacing.x;
    if (io === "i") {
      if (!node.inputs) {
        throw new Error("Cannot connect to node without inputs");
      }
      for (const input of node.inputs) {
        y = input.y > y ? input.y : y;
      }
      x -= xAdd;
    }
    if (io === "o") {
      if (!node.outputs) {
        throw new Error("Cannot connect to node without outputs");
      }
      for (const output of node.outputs) {
        y = output.y > y ? output.y : y;
      }
      x += this.theme.node.width + xAdd;
    }
    y += this.theme.node.height + this.theme.node.spacing.y;
    const tooClose = this.state.nodes.filter(
      (n) =>
        Math.abs(n.y - y) < this.theme.node.height &&
        Math.abs(n.x - x) < this.theme.node.width
    );
    if (tooClose.length) {
      y = Math.max(...tooClose.map((tc) => tc.y));
      y += this.theme.node.height + this.theme.node.spacing.y;
    }
    return { x, y };
  };
  deleteNodes = (nodes: Node[]) => {
    let n = nodes.filter((node) => !node.readonly);
    // Hack to make TS work with it n.editsDefinitions!
    // TODO: Replace
    const editsDefinitions = n
      .filter((n) => n.editsDefinitions)
      .map((n) => n.editsDefinitions!)
      .reduce((a, b) => a.concat(b), []);
    n = n.concat(
      this.state.nodes.filter((node) =>
        editsDefinitions.find((e) => e === node.definition)
      )
    );
    this.state.nodeDefinitions = this.state.nodeDefinitions.filter(
      (n) => !editsDefinitions.find((o) => o === n)
    );
    this.state.selectedNodes = this.state.selectedNodes.filter(
      (node) => !n.find((nn) => nn === node)
    );
    this.state.nodes = this.state.nodes.filter(
      (node) => !n.find((nn) => nn === node)
    );
    this.rebuildTree();
    this.descriptionManager.clearDescription();
    this.eventBus.publish("NodeDeleted", { nodes: n });
    this.eventBus.publish("RenderRequested");
  };
  createNode = ({
    center,
    position,
    nodeDefinition,
  }: {
    center?: boolean;
    position?: ScreenPosition;
    nodeDefinition: NodeDefinition;
  }) => {
    const p = position || {
      x:
        Math.max(...this.state.nodes.map((n) => n.x), 0) +
        this.theme.node.width +
        this.theme.node.spacing.x,
      y:
        Math.max(...this.state.nodes.map((n) => n.y), 0) +
        this.theme.node.height +
        this.theme.node.spacing.y,
    };
    const createdNode: Node = NodeUtils.createNode(
      p,
      nodeDefinition,
      this.state.nodeDefinitions
    );
    this.state.nodes.push(createdNode);
    this.state.trees.node.insert(
      NodeUtils.createTreeNode(createdNode, this.theme)
    );
    this.selectSingleNode(createdNode);
    this.eventBus.publish("NodeCreated", { node: createdNode });
    if (
      !createdNode.name &&
      !createdNode.notEditable &&
      !createdNode.readonly
    ) {
      this.renameManager.startRenaming(createdNode);
    }
    this.state.hover.node = undefined;
    this.eventBus.publish("RenderRequested");
    if (center) {
      this.eventBus.publish("CenterPanRequested", {
        position: {
          x: -p.x,
          y: -p.y,
        },
      });
    }
    return createdNode;
  };

  getCenter = () => {
    const X: number[] = [];
    const Y: number[] = [];
    this.state.nodes.forEach((n) => X.push(n.x) && Y.push(n.y));
    return {
      x: 0.5 * (Math.max(...X) + Math.min(...X)),
      y: 0.5 * (Math.max(...Y) + Math.min(...Y)),
    };
  };

  openPortMenu = ({
    nodeId,
    io,
    position,
  }: {
    nodeId: string;
    io: "i" | "o";
    position: ScreenPosition;
  }) => {
    const node = this.state.nodes.find((n) => n.id === nodeId);
    if (this.state.isReadOnly || this.state.drawedConnection || !node) {
      this.state.drawedConnection = undefined;
      return;
    }
    const createConnectedNodesCategory = (n: NodeDefinition): Category => ({
      name: n.type,
      help: n.help,
      action: () => {
        if (node.hideChildren) {
          this.foldChildren(node, true);
        }
        const createdNode = this.createNode({
          position: this.placeConnectedNode(node, io),
          nodeDefinition: n,
        });
        this.connectionManager.makeConnection(
          io === "i" ? node : createdNode,
          io === "o" ? node : createdNode
        );
        if (this.theme.autoBeuatify) {
          this.beautifyNodesInPlace(createdNode);
          this.htmlManager.nodeMoved();
        }
      },
    });
    const createTopicCategory = (defs: AcceptedNodeDefinition): Category => {
      if (defs.definition) {
        return createConnectedNodesCategory(defs.definition);
      }
      if (!defs.category) {
        throw new Error(
          `Cannot create Topic category out of this: ${JSON.stringify(
            defs,
            null,
            4
          )} `
        );
      }
      return {
        name: defs.category.name,
        children: defs.category.definitions.map(createTopicCategory),
      };
    };
    const { definition } = node;
    const menuCategories: Category[] = [];
    if (io === "i" && node.inputs) {
      menuCategories.push(
        ...NodeUtils.getDefinitionAcceptedInputCategories(
          definition,
          this.state.nodeDefinitions,
          undefined,
          this.state.nodes,
          node
        ).map(createTopicCategory)
      );
    } else if (io === "o" && node.outputs) {
      menuCategories.push(
        ...NodeUtils.getDefinitionAcceptedOutputCategories(
          definition,
          this.state.nodeDefinitions,
          undefined,
          this.state.nodes,
          node
        ).map(createTopicCategory)
      );
    }

    const { categories } = node.definition;
    if (categories) {
      if (io === "i" && categories.inputs) {
        menuCategories.push(...categories.inputs);
      }
      if (io === "o" && categories.outputs) {
        menuCategories.push(...categories.outputs);
      }
    }

    const NodeScreenPosition = this.uiManager.worldToScreen({
      position,
    });

    this.state.hover = {};
    this.eventBus.publish("MenuRequested", {
      e: NodeScreenPosition,
      title: `Create ${node.name} field`,
      categories: menuCategories,
    });
  };
}
