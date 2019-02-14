import { EventBus } from "../../../EventBus";
import * as Events from "../../../Events";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import {
  DiagramTheme,
  Category,
  NodeDefinition,
  DiagramState,
  AcceptedNodeDefinition
} from "../../../Models";
import { NodeManager } from "../nodeManager";
import { HoverManager } from "../hoverManager";
import { NodeUtils } from "../../../Utils";
import { ConnectionManager } from "../connectionManager";
import { UIManager } from "../uiManager";

/**
 * MenuManager:
 *
 */
export class MenuManager {
  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    private theme: DiagramTheme,
    private nodeManager: NodeManager,
    private hoverManager: HoverManager,
    private connectionManager: ConnectionManager,
    private uiManager: UIManager
  ) {
    this.eventBus.subscribe(Events.IOEvents.ScreenRightMouseUp, this.openMenu);
    this.eventBus.subscribe(
      Events.IOEvents.ScreenLeftMouseUp,
      this.clickMenuItem
    );
    this.eventBus.subscribe(
      Events.IOEvents.WorldLeftMouseUp,
      this.openPortMenu
    );
    this.eventBus.subscribe(
      Events.IOEvents.WorldLeftMouseClick,
      this.closeMenu
    );
  }
  clickMenuItem = () => {
    if (this.state.menu && this.state.hover.menu) {
      const category = this.state.categories[this.state.hover.menu.index];
      if (category.action) {
        category.action!();
        this.state.menu = undefined;
        this.state.hover.menu = undefined;
      } else if (category.children) {
        this.state.categories = category.children;
        this.state.hover.menu = undefined;
      }
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
  closeMenu = (e: ScreenPosition) => {
    if (this.state.menu && !this.state.hover.menu) {
      this.state.menu = undefined;
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
  openMenu = (e: ScreenPosition) => {
    if (this.state.draw) {
      return;
    }
    const { node, link } = this.state.hover;
    if (!node && !link) {
      this.state.categories = this.state.nodeDefinitions
        .filter(n => n.root)
        .filter(n => !n.hidden)
        .map(
          n =>
            ({
              name: n.type,
              help: n.help,
              action: () => {
                const currentPos = {
                  x: this.state.lastPosition.x - this.theme.node.width / 2.0,
                  y: this.state.lastPosition.y - this.theme.node.height / 2.0
                };
                this.nodeManager.createNode(currentPos, n);
                this.hoverManager.hover(currentPos);
              }
            } as Category)
        );
      this.state.menu = {
        position: { ...e }
      };
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
  openPortMenu = (e: ScreenPosition) => {
    if (this.state.menu || this.state.drawedConnection) {
      this.state.drawedConnection = undefined;
      return;
    }
    this.eventBus.publish(Events.DiagramEvents.PickRequested, e);
    const { io, node } = this.state.hover;
    if (node && io) {
      const createConnectedNodesCategory = (n: NodeDefinition): Category => ({
        name: n.type,
        help: n.help,
        action: () => {
          const createdNode = this.nodeManager.createNode(
            this.nodeManager.placeConnectedNode(node, io),
            n
          );
          this.connectionManager.makeConnection(
            io === "i" ? node : createdNode,
            io === "o" ? node : createdNode
          );
        }
      });
      const createTopicCategory = (defs: AcceptedNodeDefinition): Category =>
        defs.definition
          ? createConnectedNodesCategory(defs.definition)
          : {
              name: defs.category!.name,
              children: defs.category!.definitions.map(createTopicCategory)
            };
      let { definition } = node;
      if (io === "i" && node.inputs) {
        this.state.categories = NodeUtils.getDefinitionAcceptedInputCategories(
          definition,
          this.state.nodeDefinitions
        ).map(createTopicCategory);
      } else if (io === "o" && node.outputs) {
        this.state.categories = NodeUtils.getDefinitionAcceptedOutputCategories(
          definition,
          this.state.nodeDefinitions
        ).map(createTopicCategory);
      }
      if (this.state.categories.length) {
        const { menu, port } = this.theme;
        const NodeScreenPosition = this.uiManager.worldToScreen({
          ...e,
          x:
            io === "i"
              ? node.x - port.width - menu.spacing.x
              : node.x + this.theme.node.width + port.width + menu.spacing.x,
          y: node.y
        });
        this.state.menu = {
          position: {
            x:
              io === "i"
                ? NodeScreenPosition.x - menu.width
                : NodeScreenPosition.x,
            y: NodeScreenPosition.y
          }
        };
      }
      const categories = node.definition.categories;
      if (categories) {
        if (io === "i" && categories.inputs) {
          this.state.categories = this.state.categories.concat(
            categories.inputs
          );
        }
        if (io === "o" && categories.outputs) {
          this.state.categories = this.state.categories.concat(
            categories.outputs
          );
        }
      }
      this.state.hover = {};
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
}
