import { EventBus } from "../../EventBus";
import { DiagramState } from "../../Models/DiagramState";
import * as Events from "../../Events";
import { ScreenPosition } from "../../IO/ScreenPosition";
import { DiagramTheme, Node, Size, Link } from "../../Models";
import { Utils } from "../../Utils";
import { NodeDefinition } from "../../Models/NodeDefinition";
import { NodeManager } from "./nodeManager";
import { ConnectionManager } from "./connectionManager";
import { UIManager } from "./uiManager";
import { MinimapManager } from "./minimapManager";
import { HoverManager } from "./hoverManager";
import { MenuManager } from "./menuManager/index";
import { QuadTree } from "../../QuadTree/index";
import { ChangesManager } from "./changesManager/index";
import { Serializer } from "../../Serialization/index";
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
  private hoverManager: HoverManager;
  private htmlManager: HtmlManager;
  constructor(
    private eventBus: EventBus,
    private theme: DiagramTheme,
    private connectionFunction: (input: Node, output: Node) => boolean,
    private disableLinkOperations: boolean,
    private getHostElement: () => HTMLElement,
    areaSize: { width: number; height: number },
  ) {
    this.state = {
      links: [],
      nodes: [],
      nodeDefinitions: [],
      categories: [],
      selectedLinks: [],
      selectedNodes: [],
      hover: {},
      hoverMinimap: false,
      trees: {
        node: new QuadTree<Node>(),
        link: new QuadTree<Link>()
      },
      uiState: {
        minimapActive: true,
        panX: 0,
        panY: 0,
        scale: 1.0,
        areaSize,
        draggingWorld: false,
        draggingElements: false,
        draggingMinimap: false
      },
      serialisationFunction: Serializer.serialize,
      positionSerialisationFunction: Serializer.serialize
    };
    this.htmlManager = new HtmlManager(
      this.state,
      this.eventBus,
      this.getHostElement,
      this.theme,
    );
    this.uiManager = new UIManager(
      this.state.uiState,
      this.eventBus,
      this.theme
    );
    this.nodeManager = new NodeManager(
      this.state,
      this.eventBus,
      this.uiManager,
      this.theme
    );
    this.connectionManager = new ConnectionManager(
      this.eventBus,
      this.state,
      this.theme,
      this.connectionFunction
    );
    new MinimapManager(this.state, this.eventBus, this.theme);
    this.hoverManager = new HoverManager(
      this.state,
      this.eventBus,
      this.theme,
      this.disableLinkOperations
    );
    new MenuManager(
      this.state,
      this.eventBus,
      this.theme,
      this.nodeManager,
      this.connectionManager,
      this.uiManager,
      this.htmlManager,
    );

    new DescriptionManager(this.state, this.eventBus, this.htmlManager);
    new ChangesManager(this.state, this.eventBus);
    this.eventBus.subscribe(Events.IOEvents.WorldMouseDrag, this.mouseDrag);
    this.eventBus.subscribe(
      Events.DiagramEvents.RebuildTreeRequested,
      this.rebuildTrees
    );
  }
  getState() {
    return {
      ...this.state
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
  setSerialisationFunction(fn: DiagramState["serialisationFunction"]) {
    this.state.serialisationFunction = fn;
  }
  setPositionSerialisationFunction(
    fn: DiagramState["positionSerialisationFunction"]
  ) {
    this.state.positionSerialisationFunction = fn;
  }
  requestSerialise = () => {
    this.eventBus.publish(Events.DiagramEvents.SerialisationRequested);
  };
  rebuildTrees = () => {
    this.nodeManager.rebuildTree();
    this.connectionManager.rebuildTree();
  };
  centerGraph = () => {
    this.uiManager.centerPanTo(this.nodeManager.getCenter());
  };
  zeroGraph = () => {
    this.uiManager.panTo({
      x: -this.theme.node.width * 3,
      y: -this.theme.node.height * 3
    });
  };
  centerOnNode = (node: Node) => {
    const foundIndex = this.state.nodes.indexOf(node);
    if (foundIndex > -1) {
      this.eventBus.publish(Events.DiagramEvents.CenterOnNode, node);
    }
  };
  mouseDrag = ({
    withoutPan,
    calculated
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
    } else if (this.state.draw) {
      this.hoverManager.hover(calculated);
      this.connectionManager.drawConnector(calculated);
    } else if (this.state.hover.link) {
      this.connectionManager.moveLink(calculated);
    } else {
      this.uiManager.panScreen(withoutPan);
    }
  };
  areaResized = (newSize: Size) => {
    this.state.uiState.areaSize = newSize;
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  worldToScreenCoordinates = (e: ScreenPosition) =>
    this.uiManager.worldToScreen(e);
}
