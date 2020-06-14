import { EventBus } from "../../../EventBus";
import * as Events from "../../../Events";
import { ScreenPosition } from "../../../IO/ScreenPosition";
import { DiagramTheme, Category, DiagramState } from "../../../Models";
import { Utils } from "../../../Utils";
import { UIManager } from "../uiManager";
import { HtmlManager, HtmlElementRegistration } from "../htmlManager/index";
import { CSSMiniEngine } from "../../../Renderer/CssMiniEngine/index";

const CSS_PREFIX = Utils.getUniquePrefix("MenuManager");
const inputHeight = 100;

const menuInputBaseClass = (theme: DiagramTheme) => ({
  position: "fixed",
  background: theme.colors.menu.background,
  border: theme.colors.menu.borders
    ? `0.5px solid ${theme.colors.menu.borders}`
    : "",
  padding: theme.menu.padding,
  borderRadius: theme.menu.borderRadius,
  maxWidth: `${theme.menu.maxWidth}px`,
  maxHeight: `${theme.menu.maxHeight}px`,
  minWidth: `${theme.menu.input.minWidth}px`,
  minHeight: `${theme.menu.minHeight}px`,
  overflowY: "auto",
  zIndex: "100"
});

const menuInputClass = (theme: DiagramTheme) => ({
  position: "relative",
  textAlign: "left",
  verticalAlign: "middle",
  color: theme.colors.menu.text,
  fontFamily: theme.fontFamily,
  fontSize: theme.menu.category.fontSize,
  fontWeight: theme.menu.category.fontWeight,
  padding: theme.menu.category.padding,
  minWidth: `${theme.menu.input.minWidth}px`,
  cursor: "text"
});

const menuBaseClass = (theme: DiagramTheme) => ({
  position: "fixed",
  background: theme.colors.menu.background,
  border: theme.colors.menu.borders
    ? `0.5px solid ${theme.colors.menu.borders}`
    : "",
  padding: theme.menu.padding,
  borderRadius: theme.menu.borderRadius,
  maxWidth: `${theme.menu.maxWidth}px`,
  maxHeight: `${theme.menu.maxHeight}px`,
  minWidth: `${theme.menu.minWidth}px`,
  minHeight: `${theme.menu.minHeight}px`,
  overflowY: "auto",
  zIndex: "100"
});

const menuElementClass = (theme: DiagramTheme) => ({
  position: "relative",
  textAlign: "left",
  verticalAlign: "middle",
  color: theme.colors.menu.text,
  fontFamily: theme.fontFamily,
  fontSize: theme.menu.category.fontSize,
  fontWeight: theme.menu.category.fontWeight,
  padding: theme.menu.category.padding,
  cursor: "pointer"
});

/**
 * MenuManager:
 *
 */
export class MenuManager {
  activeMenu: HtmlElementRegistration | null = null;
  activeMenuInput: HtmlElementRegistration | null = null;
  inputValue: string = "";
  activeNodeMenu: boolean = false;
  activeCategories: Category[] = [];
  activeMenuPosition: ScreenPosition = { x: 0, y: 0 };
  elementsMarkup: any;
  createNodePosition: ScreenPosition | null = null;
  static menuBaseClassName = `${CSS_PREFIX}Base`;
  static menuInputBaseClassName = `${CSS_PREFIX}InputBase`;
  static menuInputClassName = `${CSS_PREFIX}Input`;
  static menuElementClassName = `${CSS_PREFIX}Element`;
  constructor(
    private state: DiagramState,
    private eventBus: EventBus,
    // private nodeManager: NodeManager,
    private uiManager: UIManager,
    private htmlManager: HtmlManager
  ) {
    this.eventBus.subscribe(Events.DiagramEvents.MenuRequested, this.openMenu);
    this.eventBus.subscribe(
      Events.DiagramEvents.MenuItemClicked,
      this.clickMenuItem
    );
    this.eventBus.subscribe(
      Events.IOEvents.WorldLeftMouseClick,
      this.closeMenus
    );
    this.eventBus.subscribe(
      Events.IOEvents.ScreenRightMouseUp,
      this.openNewNodeMenu
    );
    this.eventBus.subscribe(
      Events.DiagramEvents.MenuInputKeyUp,
      this.textTyped
    );
    CSSMiniEngine.instance.addClass(
      menuBaseClass,
      MenuManager.menuBaseClassName
    );
    CSSMiniEngine.instance.addClass(
      menuInputBaseClass,
      MenuManager.menuInputBaseClassName
    );
    CSSMiniEngine.instance.addClass(
      menuInputClass,
      MenuManager.menuInputClassName
    );
    CSSMiniEngine.instance.addClass(
      menuElementClass,
      MenuManager.menuElementClassName
    );
  }
  clickMenuItem = (category: Category) => {
    if (category.action) {
      category.action();
      this.closeMenus();
    } else if (category.children) {
      this.state.categories = category.children;
      // this.state.hover.menu = undefined;
      this.openMenu(this.activeMenuPosition);
    }
  };
  /*closeMenu = (e: ScreenPosition) => {
    if (this.state.menu && !this.state.hover.menu) {
      this.state.menu = undefined;
      this.eventBus.publish(Events.DiagramEvents.RenderRequested);
    }
  };*/
  closeMenus = () => {
    this.htmlManager.hideHelp();
    if (this.activeMenuInput) {
      this.activeMenuInput.remove();
    }
    if (this.activeMenu) {
      this.activeMenu.remove();
      this.activeMenu = null;
      this.activeNodeMenu = false
    }
  };
  closeMenuElements = () => {
    if (this.activeMenu) {
      this.activeMenu.remove();
      this.activeMenu = null;
      this.activeNodeMenu = false
    }
  };
  openNewNodeMenu = (screenPosition: ScreenPosition) => {
    if (this.state.isReadOnly || this.state.draw) {
      return;
    }
    const { node, link } = this.state.hover;
    if (node) {
      this.activeNodeMenu = true;
    }
    else if (!node && !link) {
      const createNodePosition: ScreenPosition = this.uiManager.screenToWorld(
        screenPosition
      );
      createNodePosition;
      this.state.categories = this.state.nodeDefinitions
        .filter(n => n.root)
        .filter(n => !n.hidden)
        .map(
          n =>
            ({
              name: n.type,
              help: n.help,
              action: () => {
                this.eventBus.publish(
                  Events.DiagramEvents.NodeCreationRequested,
                  createNodePosition,
                  n
                );
              }
            } as Category)
        );
      this.openMenu(screenPosition);
    }
  };
  openMenu = (e: ScreenPosition) => {
    this.closeMenus();

    if (this.state.categories.length < 1) {
      return;
    }

    if (this.state.isReadOnly || this.state.draw) {
      return;
    }

    this.activeMenuPosition = e;

    this.createNodePosition = this.uiManager.screenToWorld(e);
    this.activeCategories = [...this.state.categories];

    this.elementsMarkup = this.state.categories
      .map(
        (category, index) =>
          `<div class="${MenuManager.menuElementClassName}" data-ref="category-btn">${category.name}</div>`
      )
      .join("");
    this.renderMenuInput();
    this.renderMenuElements(this.activeCategories);
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
  renderMenuInput = () => {
    console.log(this.createNodePosition!.x)
    this.activeMenuInput = this.htmlManager.createElementFromHTML(
      `<div class="${MenuManager.menuInputBaseClassName}" data-ref="input">
      <input type="text" id="menuInput" class="${MenuManager.menuInputClassName}" placeholder="Search for categories..." title="Type in a category"/>
      </div>
      `,
      this.createNodePosition!.x,
      this.createNodePosition!.y,
      false,
      { x: 0, y: 0 }
    );
    this.activeMenuInput.refs["input"]
      .querySelector(`.${MenuManager.menuInputClassName}`)!.addEventListener("keyup", () => {
        this.eventBus.publish(Events.DiagramEvents.MenuInputKeyUp);
      });
  }
  renderMenuElements = (categories: Category[]) => {
    this.closeMenuElements();
    this.elementsMarkup = categories
      .map(
        (category, index) =>
          `<div class="${MenuManager.menuElementClassName}" data-ref="category-btn">${category.name}</div>`
      )
      .join("");

    this.activeMenu = this.htmlManager.createElementFromHTML(
      `
      <div class="${MenuManager.menuBaseClassName}" data-ref="root">
        ${this.elementsMarkup}
      </div>
      `,
      this.createNodePosition!.x,
      this.createNodePosition!.y + inputHeight,
      false,
      { x: 0, y: 0 }
    );
    this.activeMenu.refs["root"]
      .querySelectorAll(`.${MenuManager.menuElementClassName}`)
      .forEach((element, index) => {
        const category = this.activeCategories[index];
        element.addEventListener("click", () => {
          this.eventBus.publish(Events.DiagramEvents.MenuItemClicked, category);
        });
        element.addEventListener("mouseenter", () => {
          if (category.help) {
            this.htmlManager.renderHelp({
              text: category.help || "",
              title: category.name
            });
          }
        });
        element.addEventListener("mouseleave", () => {
          this.htmlManager.hideHelp();
        });
      });
  }

  textTyped = () => {
    this.inputValue = (document.getElementById('menuInput') as HTMLInputElement).value.toLowerCase();
    this.renderMenuElements(this.state.categories.filter(category => category.name.includes(this.inputValue)));
    this.eventBus.publish(Events.DiagramEvents.RenderRequested);
  };
}
