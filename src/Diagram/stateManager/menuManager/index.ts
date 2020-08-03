import { EventBus } from "@eventBus";
import { ScreenPosition } from "@io";
import { DiagramTheme, Category, DiagramState } from "@models";
import { Utils } from "@utils";
import { UIManager } from "../uiManager";
import { HtmlManager, HtmlElementRegistration } from "../htmlManager/index";
import { CSSMiniEngine, css } from "@renderer/CssMiniEngine/index";
import { Colors } from "@theme/Colors";

const CSS_PREFIX = Utils.getUniquePrefix("MenuManager");

const menuBaseClass = (theme: DiagramTheme) =>
  CSSMiniEngine.createStyle({
    position: "fixed",
    background: Colors.grey[10],
    padding: theme.menu.padding,
    borderRadius: theme.menu.borderRadius,
    width: `${theme.menu.width ? `${theme.menu.width}px` : "auto"}`,
    maxWidth: `${theme.menu.maxWidth}px`,
    maxHeight: `${theme.menu.maxHeight}px`,
    overflowY: "auto",
    zIndex: "100",
  });

const menuElementClass = (theme: DiagramTheme) =>
  CSSMiniEngine.createStyle({
    position: "relative",
    textAlign: "left",
    verticalAlign: "middle",
    color: Colors.grey[4],
    fontFamily: theme.fontFamily,
    fontSize: theme.menu.category.fontSize,
    fontWeight: theme.menu.category.fontWeight,
    padding: theme.menu.category.padding,
    transition: "all 0.25s",
    cursor: "pointer",
  });

const menuTitleClass = (theme: DiagramTheme) =>
  CSSMiniEngine.createStyle({
    position: "relative",
    textTransform: "uppercase",
    verticalAlign: "middle",
    color: Colors.grey[6],
    fontFamily: theme.fontFamily,
    fontSize: theme.menu.title.fontSize,
    padding: theme.menu.category.padding,
    cursor: "pointer",
    marginBottom: "10px",
    fontWeight: theme.menu.title.fontWeight,
  });

const menuElementClassHover = (theme: DiagramTheme) =>
  CSSMiniEngine.createStyle({
    color: Colors.grey[0],
  });
/**
 * MenuManager:
 *
 */
export class MenuManager {
  activeMenu: HtmlElementRegistration | null = null;
  activeNodeMenu = false;
  activeCategories: Category[] = [];
  activeMenuPosition: ScreenPosition = { x: 0, y: 0 };
  static menuTitleClassName = `${CSS_PREFIX}Title`;
  static menuBaseClassName = `${CSS_PREFIX}Base`;
  static menuElementClassName = `${CSS_PREFIX}Element`;
  static menuElementHoverClassName = `${CSS_PREFIX}ElementHover`;
  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    // private nodeManager: NodeManager,
    private uiManager: UIManager,
    private htmlManager: HtmlManager
  ) {
    this.eventBus.subscribe("MenuRequested", this.openMenu);
    this.eventBus.subscribe("MenuCreateNodeRequested", this.openNewNodeMenu);
    this.eventBus.subscribe("MenuItemClicked", this.clickMenuItem);
    this.eventBus.subscribe("WorldLeftMouseClick", this.closeMenus);
    this.eventBus.subscribe("ScreenRightMouseUp", this.openNewNodeMenu);
    CSSMiniEngine.instance.addCss(css``);
    CSSMiniEngine.instance.addClass(
      menuBaseClass,
      MenuManager.menuBaseClassName
    );
    CSSMiniEngine.instance.addClass(
      menuElementClass,
      MenuManager.menuElementClassName
    );
    CSSMiniEngine.instance.addClass(
      menuTitleClass,
      MenuManager.menuTitleClassName
    );
    CSSMiniEngine.instance.addClass(
      menuElementClassHover,
      MenuManager.menuElementHoverClassName
    );
  }
  clickMenuItem = ({ category }: { category: Category }) => {
    if (category.action) {
      category.action();
      this.closeMenus();
    } else if (category.children) {
      // this.state.hover.menu = undefined;
      this.openMenu({
        e: this.activeMenuPosition,
        title: category.name,
        categories: category.children,
      });
    }
  };
  closeMenus = () => {
    this.htmlManager.hideHelp();
    if (this.activeMenu) {
      this.activeMenu.remove();
      this.activeMenu = null;
      this.activeNodeMenu = false;
    }
  };
  openNewNodeMenu = ({
    position,
    nodeId,
  }: {
    position: ScreenPosition;
    nodeId?: string;
  }) => {
    const node = this.state.nodes.find((n) => n.id === nodeId);
    if (this.state.isReadOnly || this.state.draw) {
      return;
    }
    if (node) {
      this.activeNodeMenu = true;
    } else {
      const createNodePosition: ScreenPosition = this.uiManager.screenToWorld({
        position,
      });
      createNodePosition;
      const menuCategories = this.state.nodeDefinitions
        .filter((n) => n.root)
        .filter((n) => !n.hidden)
        .map(
          (n) =>
            ({
              name: n.type,
              help: n.help,
              action: () => {
                this.eventBus.publish("NodeCreationRequested", {
                  nodeDefinition: n,
                  position: createNodePosition,
                });
              },
            } as Category)
        );
      this.openMenu({
        e: position,
        title: "Create node",
        categories: menuCategories,
      });
    }
  };
  openMenu = ({
    e,
    title,
    categories,
  }: {
    e: ScreenPosition;
    title: string;
    categories: Category[];
  }) => {
    this.closeMenus();

    if (categories.length < 1) {
      return;
    }

    if (this.state.isReadOnly || this.state.draw) {
      return;
    }

    this.activeMenuPosition = e;

    const createNodePosition: ScreenPosition = this.uiManager.screenToWorld({
      position: e,
    });
    this.activeCategories = [...categories];

    const elementsMarkup = categories
      .map(
        (category) =>
          `<div class="${MenuManager.menuElementClassName}" data-ref="category-btn">${category.name}</div>`
      )
      .join("");

    this.activeMenu = this.htmlManager.createElementFromHTML(
      `
        <div class="${MenuManager.menuBaseClassName}" data-ref="root">
          <div class="${MenuManager.menuTitleClassName}">${title}</div>
          ${elementsMarkup}
        </div>
        `,
      createNodePosition.x,
      createNodePosition.y,
      false,
      { x: 0, y: 0 }
    );
    this.activeMenu.refs["root"]
      .querySelectorAll(`.${MenuManager.menuElementClassName}`)
      .forEach((element, index) => {
        const category = this.activeCategories[index];
        element.addEventListener("click", () => {
          this.eventBus.publish("MenuItemClicked", { category });
        });
        element.addEventListener("mouseenter", () => {
          element.classList.add(MenuManager.menuElementHoverClassName);
          if (category.help) {
            this.htmlManager.renderHelp({
              text: category.help || "",
              title: category.name,
            });
          }
        });
        element.addEventListener("mouseleave", () => {
          element.classList.remove(MenuManager.menuElementHoverClassName);
          this.htmlManager.hideHelp();
        });
      });

    this.eventBus.publish("RenderRequested");
  };
}
