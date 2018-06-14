import { EventListenerFunctionProps, Action } from './types';

export const addEventListeners = ({ stateUpdate, updateNode }: EventListenerFunctionProps) => {
  document.addEventListener('keypress', (e) => {
    if (e.charCode === 32) {
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
  document.addEventListener('keyup', (e) => {
    if (e.keyCode === 32) {
      stateUpdate((state) => {
        return {
          spacePressed: false
        };
      });
    }
  });
  document.addEventListener('mousemove', (e) => {
    stateUpdate((state) => {
      let stateUpdate: {} = {
        mouseX: e.clientX,
        mouseY: e.clientY
      };
      if (state.action === Action.MoveNode) {
        stateUpdate = {
          ...stateUpdate,
          ...updateNode(state.nodes, state.activeNode.id, {
            x: e.clientX + state.activeNode.x,
            y: e.clientY + state.activeNode.y
          })
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
