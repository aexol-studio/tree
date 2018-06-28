import { GraphState, GraphUpdateNode, GraphDeleteNode } from './Graph';

export type EventListenerFunctionProps = {
  stateUpdate?: (func: (state: Readonly<GraphState>) => any) => void;
  updateNode: GraphUpdateNode;
  deleteNode: GraphDeleteNode;
  whereToRun: HTMLDivElement;
};
