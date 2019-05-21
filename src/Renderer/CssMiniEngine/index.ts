function o2s(o: Partial<CSSStyleDeclaration>, className: string) {
  var elm = new Option();
  Object.keys(o).forEach(function(a: string) {
    (elm.style as any)[a as any] = o[a as any];
  });
  return `.${className}{\n${elm.getAttribute("style")}\n}`;
}
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
  addClass = (o: Partial<CSSStyleDeclaration>, className: string) => {
    this.classes.push(o2s(o, className));
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
}
