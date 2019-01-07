/**
 * Utils
 *
 * Various utils.
 */
export class Utils {
  static generateId = () =>
    new Array(crypto.getRandomValues(new Uint8Array(4))).join("-");
}
