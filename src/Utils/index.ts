import { ScreenPosition } from "@io";
import { ConfigurationManager } from "@configuration";

export { MinimapUtils } from "./minimapUtils";
export { NodeUtils } from "./nodeUtils";
export { LinkUtils } from "./linkUtils";
/**
 * Utils
 *
 * Various utils.
 */
export class Utils {
  static generateId = () => {
    return ConfigurationManager.instance.getOption("generateIdFn")();
  };
  static getUniquePrefix = (prefix = "") => {
    return `${prefix}${Math.floor(Math.random() * 9999999)}`;
  };
  static between = (a: number, b: number) => (c: number) => c >= a && c <= b;
  static clamp = (v: number, min: number, max: number) =>
    Math.max(Math.min(v, max), min);
  static dedupe = <T>(a: T[]) => a.filter((b, i) => a.indexOf(b) === i);
  static deepCopy = <T extends {}>(o: T): T => JSON.parse(JSON.stringify(o));
  static snap = <T extends ScreenPosition>(
    e: T,
    snappingGridSize: number
  ): T => ({
    ...e,
    x: Math.floor(e.x / snappingGridSize) * snappingGridSize,
    y: Math.floor(e.y / snappingGridSize) * snappingGridSize,
  });
  static componentToHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };

  static rgbToHex = (r: number, g: number, b: number) => {
    return (
      "#" +
      Utils.componentToHex(r) +
      Utils.componentToHex(g) +
      Utils.componentToHex(b)
    );
  };

  static debounce<F extends (...args: any[]) => void>(
    func: F,
    wait: number
  ): F {
    let timeoutID: number;

    return <F>(<unknown>function (t: any, ...args: any[]) {
      clearTimeout(timeoutID);
      const context = t;

      timeoutID = window.setTimeout(function () {
        func.apply(context, args);
      }, wait);
    });
  }
}
