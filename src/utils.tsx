import { NodeType, NodeTypePartial, DeepUpdateArrayType, ClonedUpdateType } from './types';
export const generateId = () => new Array(crypto.getRandomValues(new Uint8Array(4))).join('-');

export const updateClonedNodesNames = ({ ids, name, nodes }: ClonedUpdateType) => {
  const processData = (data: Array<NodeType>, ids: Array<string>) => {
    for (var no = 0; no < data.length; no++) {
      let n = data[no];
      if (ids.includes(n.id)) {
        data[no] = {
          ...n,
          name
        };
      } else if (n.nodes) {
        processData(n.nodes, ids);
      }
    }
  };
  let data = [...nodes];
  processData(data, ids);
  return {
    nodes: data
  };
};

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
      } else if (n.nodes) {
        processData(n.nodes, updated);
      }
    }
  };
  let data = [...nodes];
  processData(data, updated);
  return {
    nodes: data
  };
};
