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
import { NodeUtils } from "../../../Utils";
import { ConnectionManager } from "../connectionManager";
import { UIManager } from "../uiManager";
import { HtmlManager, HtmlElementRegistration } from "../htmlManager/index";

/**
 * MenuManager:
 *
 */
export class MenuManager {
  activeMenu: HtmlElementRegistration | null = null;
  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    private theme: DiagramTheme,
    private nodeManager: NodeManager,
    private connectionManager: ConnectionManager,
    private uiManager: UIManager,
    private htmlManager: HtmlManager,
  ) {
    this.eventBus.subscribe(Events.IOEvents.ScreenRightMouseUp, this.openMenu);
    this.eventBus.subscribe(
      Events.DiagramEvents.MenuItemClicked,
      this.clickMenuItem
    );
    this.eventBus.subscribe(
      Events.IOEvents.WorldLeftMouseUp,
      this.openPortMenu
    );
    this.eventBus.subscribe(
      Events.IOEvents.WorldLeftMouseClick,
      this.closeMenus
    );
  }
  clickMenuItem = (category: Category) => {
    if (category.action) {
      category.action!();
      this.state.menu = undefined;
      this.state.hover.menu = undefined;
    } else if (category.children) {
      this.state.categories = category.children;
      this.state.hover.menu = undefined;
    }
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  /*closeMenu = (e: ScreenPosition) => {
    if (this.state.menu && !this.state.hover.menu) {
      this.state.menu = undefined;
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };*/
  closeMenus = () => {
    if (this.activeMenu) {
      this.activeMenu.remove();
      this.activeMenu = null;
    }
  };
  openMenu = (e: ScreenPosition) => {
    this.closeMenus();
    /*if (this.state.isReadOnly || this.state.draw) {
      return;
    }
    const { node, link } = this.state.hover;
    if (!node && !link) {
      const createNodePosition: ScreenPosition = this.uiManager.screenToWorld(
        e
      );
      this.state.categories = this.state.nodeDefinitions
        .filter(n => n.root)
        .filter(n => !n.hidden)
        .map(
          n =>
            ({
              name: n.type,
              help: n.help,
              action: () => {
                this.nodeManager.createNode(createNodePosition, n);
              }
            } as Category)
        );
      this.state.menu = {
        position: { ...e }
      };
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }*/
    if (this.state.isReadOnly || this.state.draw) {
      return;
    }

    const { node, link } = this.state.hover;
    if (!node && !link) {
      const createNodePosition: ScreenPosition = this.uiManager.screenToWorld(
        e
      );
      this.activeMenu = this.htmlManager.createElement(`
        <div style="position:fixed">qweqwe</div>
      `, createNodePosition.x, createNodePosition.y, false, { x: 0, y: 0 });
    }
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  openPortMenu = (e: ScreenPosition) => {
    if (
      this.state.isReadOnly ||
      this.state.menu ||
      this.state.drawedConnection
    ) {
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
          if (this.theme.autoBeuatify)
            this.nodeManager.beautifyNodesInPlace(createdNode);
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
          this.state.nodeDefinitions,
          undefined,
          this.state.nodes,
          node
        ).map(createTopicCategory);
      } else if (io === "o" && node.outputs) {
        this.state.categories = NodeUtils.getDefinitionAcceptedOutputCategories(
          definition,
          this.state.nodeDefinitions,
          undefined,
          this.state.nodes,
          node
        ).map(createTopicCategory);
      }
      if (this.state.categories.length) {
        const NodeScreenPosition = this.uiManager.worldToScreen({
          ...e,
          x: node.x,
          y: node.y
        });
        this.state.menu = {
          position: {
            x:
              NodeScreenPosition.x +
              (io === "i" ? -this.theme.port.width : this.theme.port.width),
            y:
              NodeScreenPosition.y +
              this.theme.node.height +
              this.theme.menu.spacing.y
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
