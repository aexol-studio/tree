import { GraphState, GraphUpdateNode } from './Graph';

export type EventListenerFunctionProps = {
  stateUpdate?: (func:(state: Readonly<GraphState>) => any) => void;
  updateNode: GraphUpdateNode;
};
