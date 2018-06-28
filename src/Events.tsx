import { EventListenerFunctionProps, Action } from './types';

let isMouseOver = false;

export const addEventListeners = ({
  stateUpdate,
  updateNode,
  whereToRun,
  deleteNode
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
    if (key === 8) {
      if ((e.target as any).type !== 'text') {
        e.preventDefault();
      }
    }
    if (key === 46) {
      stateUpdate((state) => {
        if (!state.selected) {
          return {};
        }
        const stateUpdate = {
          ...deleteNode(state.selected),
          selected: null,
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
    if (e.keyCode === 32) {
      stateUpdate((state) => {
        return {
          spacePressed: false
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
