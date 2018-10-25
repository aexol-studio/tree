import {
  GraphPan,
  GraphDrawConnectors,
  GraphMoveNodes,
  GraphState,
  GraphDeleteNode,
  GraphCloneNode,
  GraphUndo,
  GraphSnapshot,
  GraphScale,
  GraphAutoPosition,
  GraphValidate,
  GraphSetCursor,
  GraphGetCursor,
  GraphCastPick,
  GraphSetAction,
  GraphGetAction
} from './Graph';

export type EventListenerFunctionProps = {
  stateUpdate?: (func: (state: Readonly<GraphState>) => any) => void;
  deleteNodes: GraphDeleteNode;
  copyNode: GraphCloneNode;
  undo: GraphUndo;
  redo: GraphUndo;
  snapshot: GraphSnapshot;
  scale: GraphScale;
  autoPosition: GraphAutoPosition;
  whereToRun: HTMLDivElement;
  validate: GraphValidate;
  pan: GraphPan;
  drawConnectors: GraphDrawConnectors;
  moveNodes: GraphMoveNodes;
  setCursor: GraphSetCursor;
  getCursor: GraphGetCursor;
  setAction: GraphSetAction;
  getAction: GraphGetAction;
  castPick: GraphCastPick;
  renderCanvas: () => void;
};
