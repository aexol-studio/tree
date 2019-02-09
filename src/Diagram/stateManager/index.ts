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
  minimapManager: MinimapManager;
  private uiManager: UIManager;
  private hoverManager: HoverManager;
  constructor(
    private eventBus: EventBus,
    private theme: DiagramTheme,
    private connectionFunction: (input: Node, output: Node) => boolean,
    areaSize: { width: number; height: number }
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
      lastPosition: {
        x: 0,
        y: 0
      },
      uiState: {
        minimapActive: true,
        panX: 0,
        panY: 0,
        scale: 1.0,
        areaSize,
        draggingWorld: false,
        draggingMinimap: false
      },
      serialisationFunction: Serializer.serialize,
      positionSerialisationFunction: Serializer.serialize
    };
    this.nodeManager = new NodeManager(this.state, this.eventBus, this.theme);
    this.connectionManager = new ConnectionManager(
      this.eventBus,
      this.state,
      this.theme,
      this.connectionFunction
    );
    this.uiManager = new UIManager(
      this.state.uiState,
      this.eventBus,
      this.theme
    );
    this.minimapManager = new MinimapManager(
      this.state,
      this.eventBus,
      this.theme
    );
    this.hoverManager = new HoverManager(this.state, this.eventBus, this.theme);
    new MenuManager(
      this.state,
      this.eventBus,
      this.theme,
      this.nodeManager,
      this.hoverManager,
      this.connectionManager,
      this.uiManager
    );
    new ChangesManager(this.state, this.eventBus);
    this.eventBus.subscribe(
      Events.IOEvents.WorldLeftMouseClick,
      this.LMBPressed
    );
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
  setSerialisationFunction(fn: DiagramState["serialisationFunction"]) {
    this.state.serialisationFunction = fn;
  }
  setPositionSerialisationFunction(
    fn: DiagramState["positionSerialisationFunction"]
  ) {
    this.state.positionSerialisationFunction = fn;
  }
  rebuildTrees = () => {
    this.nodeManager.rebuildTree();
    this.connectionManager.rebuildTree();
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
      this.nodeManager.moveNodes(withoutPan);
    } else if (this.state.draw) {
      this.hoverManager.hover(calculated);
      this.connectionManager.drawConnector(calculated);
    } else if (this.state.hover.link) {
      this.connectionManager.moveLink(calculated);
    } else {
      this.uiManager.panScreen(withoutPan);
    }
  };
  LMBPressed = (e: ScreenPosition) => {
    this.state.lastPosition = { ...e };
  };

  areaResized = (newSize: Size) => {
    this.state.uiState.areaSize = newSize;
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
}
