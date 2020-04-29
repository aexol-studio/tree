import { Link } from "../Models/Link";
import { Node } from "../Models/Node";

export interface LinkSerialized extends Pick<Link, "centerPoint"> {
  iId: string;
  oId: string;
}

export const serializeLink = ({ centerPoint, i, o }: Link): LinkSerialized => ({
  centerPoint,
  iId: i.id,
  oId: o.id
});
export const deserializeLink = (
  { centerPoint, iId, oId }: LinkSerialized,
  nodes: Node[]
): Link => ({
  centerPoint,
  i: nodes.find(n => n.id === iId)!,
  o: nodes.find(n => n.id === oId)!,
  circularReference: iId === oId
});
