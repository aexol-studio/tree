import { ScreenPosition } from "../IO/ScreenPosition";

export { MinimapUtils } from "./minimapUtils";
export { NodeUtils } from "./nodeUtils";

//TODO: Replace with uuid RFC compliant library
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Utils
 *
 * Various utils.
 */
export class Utils {
  static generateId = () => uuidv4();
  static between = (a: number, b: number) => (c: number) => c >= a && c <= b;
  static clamp = (v: number, min: number, max: number) =>
    Math.max(Math.min(v, max), min);
  static dedupe = <T>(a: T[]) => a.filter((b, i) => a.indexOf(b) === i);
  static deepCopy = <T extends Record<string, any>>(o: T): T =>
    JSON.parse(JSON.stringify(o));
  static snap = <T extends ScreenPosition>(
    e: T,
    snappingGridSize: number
  ): T => ({
    ...e,
    x: Math.floor(e.x / snappingGridSize) * snappingGridSize,
    y: Math.floor(e.y / snappingGridSize) * snappingGridSize
  });
  static componentToHex = (c: number) => {
    var hex = c.toString(16);
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
}
