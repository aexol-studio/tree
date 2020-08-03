import { EventBus } from "@eventBus";
import { DiagramState } from "@models";
import { ScreenPosition } from "@io";
import { DiagramTheme, Node, Size, Link } from "@models";
import { Utils } from "@utils";
import { NodeDefinition } from "@models";
import { NodeManager } from "./nodeManager";
import { ConnectionManager } from "./connectionManager";
import { UIManager } from "./uiManager";
import { MenuManager } from "./menuManager/index";
import { ChangesManager } from "./changesManager/index";
import { HtmlManager } from "./htmlManager/index";
import { DescriptionManager } from "./descriptionManager/index";

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
  private htmlManager: HtmlManager;
  private menuManager: MenuManager;
  private descriptionManager: DescriptionManager;
  constructor(
    private eventBus: EventBus,
    private theme: DiagramTheme,
    private connectionFunction: (input: Node, output: Node) => boolean,
    private getHostElement: () => HTMLElement,
    areaSize: { width: number; height: number }
  ) {
    this.state = {
      links: [],
      nodes: [],
      nodeDefinitions: [],
      selectedLinks: [],
      selectedNodes: [],
      hoverMinimap: false,
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
    this.htmlManager = new HtmlManager(
      this.state,
      this.eventBus,
      this.getHostElement,
      this.theme
    );
    this.descriptionManager = new DescriptionManager(
      this.state,
      this.eventBus,
      this.htmlManager
    );
    this.uiManager = new UIManager(
      this.state.uiState,
      this.eventBus,
      this.theme
    );
    this.connectionManager = new ConnectionManager(
      this.eventBus,
      this.state,
      this.theme,
      this.connectionFunction
    );
    this.menuManager = new MenuManager(
      this.state,
      this.eventBus,
      this.uiManager,
      this.htmlManager
    );
    this.nodeManager = new NodeManager(
      this.state,
      this.eventBus,
      this.uiManager,
      this.theme,
      this.connectionManager,
      this.htmlManager,
      this.descriptionManager
    );
    new ChangesManager(this.state, this.eventBus);

    this.eventBus.subscribe("WorldMouseDrag", this.mouseDrag);
  }
  getState() {
    return {
      ...this.state,
      isNodeMenuOpened: this.menuManager.activeNodeMenu,
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
      this.nodeManager.moveNodes(calculated);
    } else {
      this.uiManager.panScreen({ position: withoutPan });
    }
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
  openMenu = (position: ScreenPosition) => {
    this.menuManager.openNewNodeMenu({ position });
  };
}
