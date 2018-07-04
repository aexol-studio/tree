import { EventListenerFunctionProps, Action } from './types';
import { deepNodesUpdate } from './utils';

let isMouseOver = false;

export const addEventListeners = ({
  stateUpdate,
  deleteNodes,
  whereToRun,
  copyNode
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
  eventContainer.addEventListener('mousemove', (e) => {
    stateUpdate((state) => {
      let stateUpdate: {} = {
        mouseX: e.clientX,
        mouseY: e.clientY
      };
      if (state.action === Action.MoveNode) {
        stateUpdate = {
          ...stateUpdate,
          ...deepNodesUpdate({
            nodes: state.nodes,
            updated: state.activeNodes.map((n) => ({
              id: n.id,
              node: {
                x: e.movementX + n.x,
                y: e.movementY + n.y
              }
            }))
          }),
          activeNodes: state.activeNodes.map((n) => ({
            ...n,
            x: n.x + e.movementX,
            y: n.y + e.movementY
          }))
        };
      }
      if (state.action === Action.ConnectPort) {
        stateUpdate = {
          ...stateUpdate,
          activePort: {
            ...state.activePort,
            endX: e.clientX,
            endY: e.clientY
          }
        };
      }
      if (state.action === Action.Pan) {
        stateUpdate = {
          ...stateUpdate,
          nodes: state.nodes.map((n) => ({
            ...n,
            x: n.x + e.movementX,
            y: n.y + e.movementY
          }))
        };
      }
      return stateUpdate;
    });
  });
};
