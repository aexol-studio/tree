import { NodeType, NodeTypePartial } from '.';
export const generateId = () => new Array(crypto.getRandomValues(new Uint8Array(4))).join('-');

type DeepUpdateType = {
  nodes: Array<NodeType>;
  id: string;
  node?: NodeTypePartial;
  remove?: boolean;
};
type ClonedUpdateType = {
  ids: Array<string>;
  name: string;
  nodes: Array<NodeType>;
};
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
export const deepNodeUpdate = ({ nodes, id, node, remove }: DeepUpdateType) => {
  const processData = (data: Array<NodeType>, id: string) => {
    for (var no = 0; no < data.length; no++) {
      let n = data[no];
      if (n.id === id) {
        if (remove) {
          data.splice(no, 1);
        } else {
          data[no] = {
            ...n,
            ...node
          };
        }
      } else if (n.nodes) {
        processData(n.nodes, id);
      }
    }
  };
  let data = [...nodes];
  processData(data, id);
  return {
    nodes: data
  };
};
