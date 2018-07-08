import { EventListenerFunctionProps, Action, GraphState } from './types';
import { deepNodesUpdate } from './utils';

let isMouseOver = false;

let mouseDown = {
  down: false,
  x: 0,
  y: 0
};

export const addEventListeners = ({
  stateUpdate,
  deleteNodes,
  whereToRun,
  copyNode,
  undo,
  redo,
  snapshot
}: EventListenerFunctionProps) => {
  const eventContainer = document;
  whereToRun.addEventListener('mouseover', (e) => {
    isMouseOver = true;
  });
  whereToRun.addEventListener('mouseleave', (e) => {
    isMouseOver = false;
  });
  eventContainer.addEventListener('keydown', (e) => {
    if (!isMouseOver) {
      return;
    }
    const key = e.charCode || e.keyCode || e.key;
    const ctrlDown = e.ctrlKey || e.metaKey;
    if (key === 8) {
      if ((e.target as any).type !== 'text') {
        e.preventDefault();
      }
    }
    if (ctrlDown) {
      stateUpdate((state) => {
        if (!state.ctrlPressed) {
          return {
            ctrlPressed: true
          };
        }
        return {};
      });
      if (key === 68) {
        e.preventDefault();
        copyNode();
      }
      if (key === 90) {
        e.preventDefault();
        undo();
      }
      if (key === 89) {
        e.preventDefault();
        redo();
      }
    }
    if (key === 46) {
      stateUpdate((state) => {
        if (state.activeNodes.length === 0) {
          return {};
        }
        const stateUpdate = {
          ...deleteNodes(),
          selected: [],
          renamed: null
        };
        return stateUpdate;
      });
    }
    if (key === 32) {
      stateUpdate((state) => {
        if (!state.spacePressed) {
          return {
            spacePressed: true,
            spaceX: state.mouseX,
            spaceY: state.mouseY
          };
        }
        return {};
      });
    }
  });
  eventContainer.addEventListener('keyup', (e) => {
    const ctrlDown = e.ctrlKey || e.metaKey || e.key === 'Meta' || e.key === 'Ctrl';
    if (e.keyCode === 32) {
      stateUpdate((state) => {
        return {
          spacePressed: false
        };
      });
    }
    if (ctrlDown) {
      stateUpdate((state) => {
        return {
          ctrlPressed: false
        };
      });
    }
  });
  eventContainer.addEventListener('mouseup', (e) => {
    mouseDown = {
      ...mouseDown,
      down: false
    };
  });
  eventContainer.addEventListener('mousedown', (e) => {
    mouseDown = {
      x: e.clientX,
      y: e.clientY,
      down: true
    };
  });
  eventContainer.addEventListener('mousemove', (e) => {
    stateUpdate((state) => {
      let stateUpdate: Partial<GraphState> = {
        mouseX: e.clientX,
        mouseY: e.clientY
      };
      let m = {
        x: e.clientX - mouseDown.x,
        y: e.clientY - mouseDown.y
      };
      mouseDown = {
        x: e.clientX,
        y: e.clientY,
        down: mouseDown.down
      };
      if (state.action === Action.SelectedNode && (m.x || m.y)) {
        stateUpdate.action = Action.MoveNode;
        snapshot('past','future')
      }
      if (
        mouseDown.down &&
        (state.action === Action.MoveNode || stateUpdate.action === Action.MoveNode)
      ) {
        stateUpdate = {
          ...stateUpdate,
          ...deepNodesUpdate({
            nodes: state.nodes,
            updated: state.activeNodes.map((n) => ({
              id: n.id,
              node: {
                x: m.x + n.x,
                y: m.y + n.y
              }
            }))
          }),
          activeNodes: state.activeNodes.map((n) => ({
            ...n,
            x: n.x + m.x,
            y: n.y + m.y
          }))
        };
      }
      if (state.action === Action.ConnectPort) {
        stateUpdate = {
          ...stateUpdate,
          activePort: {
            ...state.activePort,
            endX: e.clientX - state.pan.x,
            endY: e.clientY - state.pan.y
          }
        };
      }
      if (state.action === Action.Pan) {
        stateUpdate = {
          ...stateUpdate,
          pan: {
            x: state.pan.x + m.x,
            y: state.pan.y + m.y
          }
        };
      }
      return stateUpdate;
    });
  });
};
