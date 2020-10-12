import { EventBus } from "@eventBus";
import { DiagramState } from "@models";
import { ScreenPosition } from "@io";
import { DiagramTheme, Node, Size, Link } from "@models";
import { Utils } from "@utils";
import { NodeDefinition } from "@models";
import { NodeManager } from "./nodeManager";
import { ConnectionManager } from "./connectionManager";
import { UIManager } from "./uiManager";
import { MinimapManager } from "./minimapManager";
import { HoverManager } from "./hoverManager";
import { QuadTree } from "@quadTree";

/**
 * StateManager:
 *
 * Main data store. Responsibilities:
 * - storing main arrays of nodes, links, etc.
 * - storing current state of diagram: selected nodes, selected links etc.
 * - methods for serializing and deserializing data
 * - listening for IO events on event bus and responding accordingly
 */
export class StateManager {
  private state: DiagramState;
  private nodeManager: NodeManager;
  private connectionManager: ConnectionManager;
  private uiManager: UIManager;
  private hoverManager: HoverManager;
  constructor(
    private eventBus: EventBus,
    private theme: DiagramTheme,
    areaSize: { width: number; height: number }
  ) {
    this.state = {
      links: [],
      nodes: [],
      nodeDefinitions: [],
      selectedLinks: [],
      selectedNodes: [],
      hover: {},
      hoverMinimap: false,
      trees: {
        node: new QuadTree<Node>(),
        link: new QuadTree<Link>(),
      },
      uiState: {
        minimapActive: true,
        panX: 0,
        panY: 0,
        scale: 1.0,
        lastDragPosition: {
          x: 0,
          y: 0,
        },
        areaSize,
        draggingWorld: false,
        draggingElements: false,
        draggingMinimap: false,
        animatingPan: false,
      },
      screenShotInProgress: false,
    };
    this.uiManager = new UIManager(
      this.state.uiState,
      this.eventBus,
      this.theme
    );
    this.connectionManager = new ConnectionManager(this.state, this.theme);
    this.nodeManager = new NodeManager(this.state, this.eventBus, this.theme);
    new MinimapManager(this.state, this.eventBus, this.theme);
    this.hoverManager = new HoverManager(this.state, this.eventBus, this.theme);
    this.eventBus.subscribe("WorldMouseDrag", this.mouseDrag);
    this.eventBus.subscribe("RebuildTreeRequested", this.rebuildTrees);
  }
  getState() {
    return {
      ...this.state,
    };
  }
  pureState = () => this.state;
  setDefinitions(nodeDefinitions: NodeDefinition[]) {
    this.state.nodeDefinitions = nodeDefinitions;
    for (const nd of this.state.nodeDefinitions) {
      if (!nd.id) {
        nd.id = Utils.generateId();
      }
    }
  }
  setNodes(nodes: Node[]) {
    this.nodeManager.loadNodes(nodes);
  }
  setLinks(links: Link[]) {
    this.connectionManager.loadLinks(links);
  }
  setReadOnly(isReadOnly: boolean) {
    this.state.isReadOnly = isReadOnly;
  }
  requestSerialise = () => {
    this.eventBus.publish("SerialisationRequested");
  };
  rebuildTrees = () => {
    this.nodeManager.rebuildTree();
    this.connectionManager.rebuildTree();
  };
  calculateAnimations = (timeCoefficient: number) => {
    return this.uiManager.calculateAnimations(timeCoefficient);
  };
  centerGraph = () => {
    this.uiManager.centerPanTo({ position: this.nodeManager.getCenter() });
  };
  selectNode = (node: Node) => {
    this.nodeManager.selectSingleNode(node);
  };
  zeroGraph = () => {
    this.uiManager.panTo({
      position: {
        x: -this.theme.node.width * 3,
        y: -this.theme.node.height * 3,
      },
    });
  };
  centerOnNode = (node: Node) => {
    const foundIndex = this.state.nodes.indexOf(node);
    if (foundIndex > -1) {
      this.eventBus.publish("CenterOnNode", { node });
    }
  };
  mouseDrag = ({
    withoutPan,
    calculated,
  }: {
    withoutPan: ScreenPosition;
    calculated: ScreenPosition;
  }) => {
    if (this.state.uiState.draggingMinimap) {
      return;
    }
    const { selectedNodes } = this.state;
    if (selectedNodes.length > 0) {
      return;
    }
    if (this.state.draw) {
      this.hoverManager.hover({ position: calculated });
      return;
    }
    this.uiManager.panScreen({ position: withoutPan });
  };
  areaResized = (newSize: Size) => {
    this.state.uiState.areaSize = newSize;
    this.eventBus.publish("RenderRequested");
  };
  worldToScreenCoordinates = (position: ScreenPosition) =>
    this.uiManager.worldToScreen({ position });
  setScreenShotInProgress(screenShotInProgress: boolean) {
    this.state.screenShotInProgress = screenShotInProgress;
  }
  isScreenShotInProgress() {
    return this.state.screenShotInProgress;
  }
}
