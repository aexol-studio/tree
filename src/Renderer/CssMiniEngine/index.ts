import { DiagramTheme } from "@models";
import { ConfigurationManager } from "@configuration";

type classNameParameter =
  | ((theme: DiagramTheme) => Partial<CSSStyleDeclaration>)
  | Partial<CSSStyleDeclaration>;

function classToStyle(
  classArgument: classNameParameter,
  className: string,
  afterBefore: string
) {
  let o: Partial<CSSStyleDeclaration>;
  if (typeof classArgument === "function") {
    o = classArgument(ConfigurationManager.instance.getOption("theme"));
  } else {
    o = classArgument;
  }
  const elm = new Option();
  Object.keys(o).forEach(function (a: string) {
    (elm.style as any)[a as any] = o[a as any];
  });
  if (afterBefore) {
    return `.${className}${afterBefore}{\ncontent:'';${elm.getAttribute(
      "style"
    )}\n}`;
  } else {
    return `.${className}${afterBefore}{\n${elm.getAttribute("style")}\n}`;
  }
}

export const css = (
  css: TemplateStringsArray,
  ...expr: (string | number)[]
): string => {
  let str = "";
  css.forEach((string, i) => {
    str += string + (expr[i] || "");
  });
  return str;
};
/**
 * Class responsible for small css functionalities rendered in HTML like menu
 *
 * @export
 * @class CSSMiniEngine
 */
export class CSSMiniEngine {
  classes: string[] = [];
  /**
   * add css class with css params
   *
   * @memberof CSSMiniEngine
   * @param {Partial<CSSStyleDeclaration>} o
   * @param {string} className
   */
  addClass = (o: classNameParameter, className: string, afterBefore = "") => {
    this.classes.push(classToStyle(o, className, afterBefore));
  };
  addCss = (css: string) => {
    this.classes.push(css);
  };
  /**
   * compile to style tag in head
   *
   * @memberof CSSMiniEngine
   */
  compile = () => {
    const head = document.head || document.getElementsByTagName("head")[0];
    const style = document.createElement("style");
    head.appendChild(style);
    style.type = "text/css";
    style.appendChild(document.createTextNode(this.classes.join("\n")));
  };
  static createStyle = (style: Partial<CSSStyleDeclaration>) => style;
  static get instance() {
    return _instance;
  }
}

const _instance = new CSSMiniEngine();
