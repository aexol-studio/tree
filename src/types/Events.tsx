import { GraphState, GraphDeleteNode, GraphCloneNode, GraphUndo, GraphSnapshot } from './Graph';

export type EventListenerFunctionProps = {
  stateUpdate?: (func: (state: Readonly<GraphState>) => any) => void;
  deleteNodes: GraphDeleteNode;
  copyNode: GraphCloneNode;
  undo: GraphUndo;
  redo: GraphUndo;
  snapshot: GraphSnapshot;
  whereToRun: HTMLDivElement;
};
