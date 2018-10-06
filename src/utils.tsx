import { NodeType, NodeTypePartial, DeepUpdateArrayType, LinkType } from './types';
export const generateId = () => new Array(crypto.getRandomValues(new Uint8Array(4))).join('-');

export const deepNodesUpdate = ({ nodes, updated, remove }: DeepUpdateArrayType) => {
  const processData = (
    data: Array<NodeType>,
    updated: Array<{ id: string; node?: NodeTypePartial }>
  ) => {
    for (var no = data.length - 1; no >= 0; no--) {
      let n = data[no];
      let up = updated.find((u) => u.id === n.id);
      if (up) {
        if (remove) {
          data.splice(no, 1);
        } else {
          data[no] = {
            ...n,
            ...up.node
          };
        }
      }
    }
  };
  let data = [...nodes];
  processData(data, updated);
  return {
    nodes: data
  };
};
export const inputsSelection = (
  node: NodeType,
  nodes: NodeType[],
  links: LinkType[]
): NodeType[] => {
  const linked = links.filter((l: LinkType) => l.to.nodeId === node.id).map((l) => l.from.nodeId);
  return linked.map((l) => nodes.find((n) => n.id === l));
};

export const treeSelection = (node: NodeType, nodes: NodeType[], links: LinkType[]): NodeType[] => {
  const selectedNodes = function*(nodeId: string) {
    yield nodeId;
    const linked = links.filter((l: LinkType) => l.to.nodeId === nodeId).map((l) => l.from.nodeId);
    for (var l of linked) {
      yield* selectedNodes(l);
    }
  };
  return [...selectedNodes(node.id)].map((n) => nodes.find((nf) => nf.id === n));
};

export const graphSelection = (
  node: NodeType,
  nodes: NodeType[],
  links: LinkType[]
): NodeType[] => {
  const yielded = [];
  const selectedNodes = function*(nodeId: string) {
    yielded.push(nodeId);
    yield nodeId;
    const linked = links
      .filter((l: LinkType) => l.to.nodeId === nodeId && !yielded.includes(l.from.nodeId))
      .map((l) => l.from.nodeId)
      .concat(
        links
          .filter((l: LinkType) => l.from.nodeId === nodeId && !yielded.includes(l.to.nodeId))
          .map((l) => l.to.nodeId)
      );
    for (var l of linked) {
      yield* selectedNodes(l);
    }
  };
  return [...selectedNodes(node.id)].map((n) => nodes.find((nf) => nf.id === n));
};
