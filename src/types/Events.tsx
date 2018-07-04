import { GraphState, GraphDeleteNode, GraphCloneNode } from './Graph';

export type EventListenerFunctionProps = {
  stateUpdate?: (func: (state: Readonly<GraphState>) => any) => void;
  deleteNodes: GraphDeleteNode;
  copyNode: GraphCloneNode;
  whereToRun: HTMLDivElement;
};
