import { ScreenPosition } from "../IO/ScreenPosition";
import { DiagramTheme, Category } from "../Models";
import { HelpRenderer } from "./helpRenderer";
import { EventBus } from "../EventBus/index";
import { DiagramEvents } from "../Events/index";
import { CSSMiniEngine } from "./CssMiniEngine/index";
export class MenuRenderer {
  private htmlMenuElement: HTMLDivElement;
  private categories: Category[] = [];
  private hoverCategory?: Category;
  private helpRenderer: HelpRenderer;
  constructor(
    private context: CanvasRenderingContext2D,
    private theme: DiagramTheme,
    private eventBus: EventBus,
    private cssMiniEngine: CSSMiniEngine
  ) {
    this.helpRenderer = new HelpRenderer(this.context, this.theme);
    this.htmlMenuElement = this.createHTMLMenuBackground();
    this.context.canvas.parentElement!.appendChild(this.htmlMenuElement);
  }
  hideMenu() {
    this.htmlMenuElement!.style.display = "none";
  }
  showMenu() {
    this.htmlMenuElement!.style.display = "block";
  }
  createHTMLMenuBackground() {
    const base = document.createElement("div");
    const baseClassName = "DiagramMenuBase";
    this.cssMiniEngine.addClass(
      {
        position: "fixed",
        background: this.theme.colors.menu.background,
        padding: this.theme.menu.padding,
        borderRadius: this.theme.menu.borderRadius,
        maxWidth: `${this.theme.menu.maxWidth}px`,
        maxHeight: `${this.theme.menu.maxHeight}px`,
        overflowY: "auto",
        zIndex: "100"
      },
      baseClassName
    );
    base.classList.add(baseClassName);
    this.cssMiniEngine.addClass(
      {
        position: "relative",
        textAlign: "left",
        verticalAlign: "middle",
        color: this.theme.colors.menu.text,
        fontSize: this.theme.menu.category.fontSize,
        fontWeight: this.theme.menu.category.fontWeight,
        padding: this.theme.menu.category.padding,
        cursor: "pointer"
      },
      "DiagramMenuNodeElement"
    );
    return base;
  }
  createHTMLMenuElement(name: string) {
    const element = document.createElement("div");
    element.classList.add("DiagramMenuNodeElement");
    element.innerText = name;
    return element;
  }
  getNodeFont(size: number, weight = "normal") {
    return `${weight} ${size}px ${
      this.context.font.split(" ")[this.context.font.split(" ").length - 1]
    }`;
  }
  render(e: ScreenPosition, categories: Category[]) {
    this.htmlMenuElement.style.top = `${e.y / 2.0 +
      this.context.canvas.offsetTop}px`;
    this.htmlMenuElement.style.left = `${e.x / 2.0 +
      this.context.canvas.offsetLeft}px`;
    this.showMenu();
    if (this.hoverCategory) {
      this.helpRenderer.render({
        text: this.hoverCategory.help || "",
        title: this.hoverCategory.name
      });
    }
    if (categories !== this.categories) {
      this.htmlMenuElement.innerHTML = "";
      this.categories = categories;
      categories.forEach((category, index) => {
        const categoryElement = this.createHTMLMenuElement(category.name);
        categoryElement.onmouseover = () => {
          categoryElement.style.color = this.theme.colors.menu.hover;
          this.hoverCategory = category;
          this.helpRenderer.render({
            text: this.hoverCategory.help || "",
            title: this.hoverCategory.name
          });
        };
        categoryElement.onmouseout = () => {
          categoryElement.style.color = this.theme.colors.menu.text;
          if (this.hoverCategory === category) {
            this.hoverCategory = undefined;
          }
        };
        categoryElement.onmousedown = e => {
          if (e.which === 1) {
            this.eventBus.publish(DiagramEvents.MenuItemClicked, category);
          }
        };
        this.htmlMenuElement.appendChild(categoryElement);
      });
    }
  }
}
