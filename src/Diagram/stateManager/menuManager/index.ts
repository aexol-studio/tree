import { EventBus } from "../../../EventBus";
import { DiagramState } from "../../../Models/DiagramState";
import * as Events from "../../../Events";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import { DiagramTheme, Category } from "../../../Models";
import { NodeManager } from "../nodeManager/index";
import { HoverManager } from "../hoverManager/index";
import { Utils } from "../../../Utils/index";
import { ConnectionManager } from "../connectionManager/index";
import { UIManager } from "../uiManager/index";
import { NodeDefinition } from "../../../Models/NodeDefinition";

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
      Events.IOEvents.ScreenLeftMouseUp,
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
        .filter(n => n.object)
        .map(
          n =>
            ({
              name: n.node.type,
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
    if (!this.state.draw) {
      return;
    }
    const { io, node } = this.state.hover;
    const { io: ioD, node: nodeD } = this.state.draw;

    if (nodeD === node && io === ioD && !this.state.menu) {
      const createConnectedNodesCategory = (n: NodeDefinition) => ({
        name: n.node.type,
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
      let { definition } = node;
      let staticCategories: Category[] = [];
      let dynamicCategories: Category[] = [];
      if (io === "i" && definition.acceptsInputs) {
        staticCategories = Utils.getDefinitionAcceptedInputs(definition)
          .filter(n => !n.object)
          .map(createConnectedNodesCategory);
        dynamicCategories = Utils.getDefinitionAcceptedInputs(definition)
          .filter(n => n.object)
          .map(
            n =>
              ({
                name: `${n.node.type} →`,
                children: this.state.nodeDefinitions
                  .filter(nd => nd.parent === n)
                  .map(createConnectedNodesCategory)
              } as Category)
          )
          .filter(c => c.children!.length > 0);
      } else if (io === "o") {
        staticCategories = this.state.nodeDefinitions
          .filter(n => !n.object && !(n.parent && n.parent.object))
          .filter(nd =>
            Utils.getDefinitionAcceptedInputs(nd).find(
              ai => ai === definition || ai === definition.parent
            )
          )
          .map(createConnectedNodesCategory);
        dynamicCategories = this.state.nodeDefinitions
          .filter(n => n.object)
          .map(
            n =>
              ({
                name: `${n.node.type} →`,
                children: this.state.nodeDefinitions
                  .filter(nd =>
                    Utils.getDefinitionAcceptedInputs(nd).find(
                      ai => ai === definition || ai === definition.parent
                    )
                  )
                  .filter(nd => nd.parent === n)
                  .map(createConnectedNodesCategory)
              } as Category)
          )
          .filter(c => c.children!.length > 0);
      }
      this.state.categories = staticCategories.concat(dynamicCategories);
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
      this.state.hover = {};
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };
}
