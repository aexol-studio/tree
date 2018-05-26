import * as React from 'react';
import * as styles from './style';
import { SpaceBarMenu, SpaceBarCategory, SpaceBarAction } from './SpaceBarMenu';
import { NodeType, NodeTypePartial } from './Node';
import { Node } from './SimpleNode';
import { GraphProps, GraphState, GraphInitialState, Action } from './GraphDefs';
import { LinkWidget } from './Link';
import { Port, PortType } from './Port';
import { Props } from './Props';
import { generateId, deepNodeUpdate, updateClonedNodesNames } from './utils';
import { renderLinks } from './render';

export class Graph extends React.Component<GraphProps, GraphState> {
  background;
  state = {
    ...GraphInitialState
  };
  get p() {
    if (this.state.activePort) {
      const { x, y, endX, endY } = this.state.activePort;
      return {
        x: this.oX(x),
        y: this.oY(y),
        endX: this.oX(endX),
        endY: this.oY(endY)
      };
    }
    return this.state.activePort;
  }
  componentDidUpdate(prevProps: GraphProps, prevState: GraphState) {
    if (prevState.nodes !== this.state.nodes || prevState.links !== this.state.links) {
      this.serialize();
    }
    if (
      prevState.selected !== this.state.selected &&
      this.props.selectedNode !== this.state.selected
    ) {
      this.props.onNodeSelect(this.state.selected);
    }
  }
  static getDerivedStateFromProps(nextProps: GraphProps, prevState: GraphState) {
    if (
      prevState.action === Action.Nothing &&
      nextProps.selectedNode &&
      nextProps.selectedNode !== prevState.selected
    ) {
      return {
        selected: nextProps.selectedNode
      };
    }
    if (prevState.loaded !== nextProps.loaded) {
      return {
        loaded: nextProps.loaded,
        nodes: nextProps.loaded.nodes,
        links: nextProps.loaded.links
      };
    }
    return null;
  }
  nodes = (nodes: Array<NodeType>): Array<NodeType> => {
    const processData = function*(data) {
      for (var n of data) {
        yield n;
        if (n.nodes && n.nodes.length) {
          yield* processData(n.nodes);
        }
      }
    };
    let allNodes = processData(nodes);
    return [...allNodes];
  };
  deleteLinks = (id: string) => {
    let { nodes = [] } = this.nodes(this.state.nodes).find((n) => n.id === id);
    let deletedNodes = [id, ...this.nodes(nodes).map((n) => n.id)];
    const links = {
      links: this.state.links.filter(
        (l) => !deletedNodes.includes(l.from.nodeId) && !deletedNodes.includes(l.to.nodeId)
      )
    };
    return links;
  };
  deleteNode = (id: string) => {
    return {
      ...this.deleteLinks(id),
      ...deepNodeUpdate({ nodes: this.state.nodes, id: id, remove: true })
    };
  };
  updateNode = (nodes: Array<NodeType>, id: string, node: NodeTypePartial) => {
    return deepNodeUpdate({ nodes, id, node });
  };
  bX = (x: number): number => -x + this.background.offsetLeft + this.background.offsetWidth;
  bY = (y: number): number => -y + this.background.offsetTop + this.background.offsetHeight;
  aX = (x: number): number => x + this.background.offsetLeft;
  aY = (y: number): number => y + this.background.offsetTop;
  oX = (x: number): number => x - this.background.offsetLeft;
  oY = (y: number): number => y - this.background.offsetTop;
  toggleSpace = (spacePressed: boolean) => {
    this.setState({
      spacePressed,
      spaceX: this.state.mouseX,
      spaceY: this.state.mouseY
    });
  };
  componentDidMount() {
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 32 && !this.state.spacePressed) {
        this.toggleSpace(true);
      }
    });
    document.addEventListener('keyup', (e) => {
      if (e.keyCode === 32) {
        this.toggleSpace(false);
      }
    });
    document.addEventListener('mousemove', (e) => {
      this.setState((state) => {
        let stateUpdate: {} = {
          mouseX: e.clientX,
          mouseY: e.clientY
        };
        if (state.action === Action.MoveNode) {
          stateUpdate = {
            ...stateUpdate,
            ...this.updateNode(state.nodes, state.activeNode.id, {
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
          let { nodes } = state;
          stateUpdate = {
            ...stateUpdate,
            nodes: nodes.map((n) => ({
              ...n,
              x: n.x + e.movementX,
              y: n.y + e.movementY
            }))
          };
        }
        return stateUpdate;
      });
    });
  }
  addNode = (node: NodeType) => {
    this.setState((state) => {
      const { expand, nodes, spaceX, spaceY } = state;
      let newNode: NodeType = {
        ...node,
        id: generateId(),
        x: spaceX,
        y: spaceY,
        nodes: []
      };
      let updateNodes = {};
      if (expand) {
        const oldNodeNodes = this.nodes(nodes).find((n) => n.id === expand).nodes;
        updateNodes = this.updateNode(nodes, expand, {
          nodes: [...oldNodeNodes, newNode]
        });
      } else {
        updateNodes = {
          nodes: [...state.nodes, newNode]
        };
      }
      return updateNodes;
    });
  };
  cloneNode = (node: NodeType) => {
    this.addNode({
      ...node,
      id: generateId(),
      inputs: node.inputs.map((i) => ({ ...i, id: generateId() })),
      outputs: node.outputs.map((i) => ({ ...i, id: generateId() }))
    });
  };
  reset = (updateState = {}) => {
    this.setState({
      action: Action.Nothing,
      activePort: null,
      activeNode: null,
      selected: null,
      ...updateState
    });
  };
  portDown = (x: number, y: number, portId: string, id: string, output: boolean) => {
    this.setState({
      action: Action.ConnectPort,
      activePort: {
        x,
        y,
        id,
        portId,
        output,
        endX: x,
        endY: y
      }
    });
  };
  portUp = (x: number, y: number, portId: string, id: string, output: boolean) => {
    const { activePort } = this.state;
    const ports = [
      {
        nodeId: activePort.id,
        portId: activePort.portId
      },
      {
        nodeId: id,
        portId
      }
    ];
    if (activePort && activePort.portId !== portId) {
      if (activePort.output === output) {
        this.reset();
        return;
      }
      let from = activePort.output ? ports[0] : ports[1];
      let to = activePort.output ? ports[1] : ports[0];
      this.reset({
        links: [
          ...this.state.links,
          {
            from,
            to
          }
        ]
      });
    }
  };
  addPort = (port: PortType) => {
    const updatedNode = this.nodes(this.state.nodes).find((n) => n.id === this.state.selected);
    this.setState((state) => ({
      ...this.updateNode(state.nodes, state.selected, {
        ...updatedNode,
        inputs: [
          ...updatedNode.inputs,
          {
            ...port,
            id: generateId()
          }
        ]
      })
    }));
  };
  updatePortPositions = (x, y, portId, id, output: boolean) => {
    this.setState((state) => {
      const modifyState = (portMode: 'inputs' | 'outputs') => {
        let n = this.nodes(state.nodes).find((n) => n.id === id);
        let ports = n[portMode].map((p) => (p.id === portId ? { ...p, x, y } : p));
        return this.updateNode(state.nodes, id, {
          [portMode]: ports
        });
      };
      if (output) {
        return modifyState('outputs');
      } else {
        return modifyState('inputs');
      }
    });
  };
  renderMainPorts = (node: NodeType, ports: Array<PortType>, output: boolean) => {
    return ports.map((i) => (
      <Port
        name={i.name}
        key={i.id}
        portDown={(x, y) => {
          this.portDown(x, y, i.id, node.id, i.output);
        }}
        portUp={(x, y) => {
          this.portUp(x, y, i.id, node.id, i.output);
        }}
        portPosition={(x, y) => {
          this.updatePortPositions(x, y, i.id, node.id, output);
        }}
        output={!output}
      />
    ));
  };
  renderExpandedNodePorts = (node: NodeType) => {
    const { inputs, outputs } = node;
    return (
      <div
        className={styles.DependencyExpand}
        style={{
          pointerEvents: 'none'
        }}
      >
        <div className={styles.DependencyInputs}>{this.renderMainPorts(node, inputs, false)}</div>
        <div className={styles.DependencyOutputs}>{this.renderMainPorts(node, outputs, true)}</div>
      </div>
    );
  };
  renderNodes = (nodes) => {
    return nodes.filter((node) => node.id !== this.state.expand).map((node) => (
      <Node
        {...node}
        key={node.id}
        id={node.id}
        selected={this.state.selected === node.id}
        addPort={this.addPort}
        portDown={this.portDown}
        portUp={this.portUp}
        portPosition={(x, y, portId, id, output) => {
          this.updatePortPositions(x, y, portId, id, output);
        }}
        nodeDown={(id: string, x: number, y: number) => {
          this.setState({
            action: Action.MoveNode,
            activeNode: { id, x: x - this.state.mouseX, y: y - this.state.mouseY },
            selected: node.id
          });
        }}
        nodeUp={(id: string) => {
          this.reset({
            selected: node.id
          });
        }}
      />
    ));
  };
  expandNode = (selectedNode) => {
    console.log('selectedNode');
    this.setState((state) => ({
      expand: selectedNode,
      path: [...state.path, selectedNode],
      selected: null
    }));
  };
  shrinkNode = (selectedNode) => {
    let path = this.state.path;
    path.pop();
    let expand = path[path.length - 1];
    this.setState({
      expand,
      path,
      selected: selectedNode
    });
  };
  spaceBarCategories = (): Array<SpaceBarCategory> => {
    const { categories } = this.props;
    let spaceBarCategories = categories.map((c) => {
      if (c.type === SpaceBarAction.AddNode) {
        return {
          ...c,
          items: c.items.map((i) => ({
            name: i.name,
            action: () => {
              this.addNode({
                ...i,
                id: generateId(),
                inputs: i.inputs.map((input) => ({ ...input, id: generateId() })),
                outputs: i.outputs.map((output) => ({ ...output, id: generateId() }))
              });
            }
          }))
        };
      }
      if (c.type === SpaceBarAction.Action) {
        return {
          ...c
        };
      }
    });
    spaceBarCategories = [
      {
        name: 'node',
        type: SpaceBarAction.Action,
        items: this.state.selected
          ? [
              {
                name: 'expand',
                action: () => {
                  this.expandNode(this.state.selected);
                }
              },
              {
                name: 'delete',
                action: () => {
                  this.setState((state) => ({
                    ...this.deleteNode(state.selected),
                    selected: null
                  }));
                }
              },
              {
                name: 'unlink',
                action: () => {
                  this.setState((state) => ({
                    ...this.deleteLinks(state.selected)
                  }));
                }
              },
              {
                name: 'duplicate',
                action: () => {
                  this.cloneNode(
                    this.nodes(this.state.nodes).find((n) => n.id === this.state.selected)
                  );
                }
              }
            ]
          : this.state.expand
            ? [
                {
                  name: 'back',
                  action: () => {
                    this.shrinkNode(this.state.expand);
                  }
                }
              ]
            : []
      },
      ...spaceBarCategories
    ];
    return spaceBarCategories;
  };
  serialize = () => {
    const { serialize } = this.props;
    if (serialize) {
      serialize(this.nodes(this.state.nodes), this.state.links);
    }
  };
  load = () => {
    const { load } = this.props;
    if (load) {
      this.setState({
        nodes: load()
      });
    }
  };
  render() {
    let { nodes, expand, links } = this.state;
    let selectedNode = this.state.selected || this.state.expand;
    if (expand) {
      nodes = this.nodes(nodes);
      let expandNode = nodes.find((n) => n.id === expand);
      nodes = expandNode.nodes;
      nodes = nodes || [];
      nodes = [...nodes, { ...expandNode, x: this.aX(0), y: this.aY(0) }];
    }
    links = links.filter(
      (l) => nodes.find((n) => n.id === l.from.nodeId) && nodes.find((n) => n.id === l.to.nodeId)
    );
    nodes = nodes.map((n) => ({
      ...n,
      inputs: n.inputs.map((i) => ({
        ...i,
        connected: !!links.find((l) => l.from.portId === i.id || l.to.portId === i.id)
      })),
      outputs: n.outputs.map((i) => ({
        ...i,
        connected: !!links.find((l) => l.from.portId === i.id || l.to.portId === i.id)
      }))
    }));
    return (
      <div
        ref={(ref) => {
          this.background = ref;
        }}
        className={styles.DependencyBackground}
        onMouseDown={(e) => {
          this.setState({
            action: Action.Pan
          });
        }}
        onMouseUp={(e) => {
          this.reset();
        }}
      >
        <div className={styles.DependencyNodes}>
          {this.renderNodes(nodes)}
          {expand &&
            this.renderExpandedNodePorts(this.nodes(this.state.nodes).find((n) => n.id === expand))}
          <svg
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            {this.state.activePort && (
              <LinkWidget
                start={{
                  x: this.p.x,
                  y: this.p.y
                }}
                end={{
                  x: this.p.endX,
                  y: this.p.endY
                }}
              />
            )}
            {renderLinks(links, nodes, this.oX, this.oY, selectedNode)}
          </svg>
        </div>
        {nodes.length === 0 && (
          <div className={styles.HelperScreen}>
            <div className={styles.HelperPhrase}>Press and hold spacebar to add new nodes</div>
          </div>
        )}
        {this.state.spacePressed && (
          <SpaceBarMenu
            x={this.state.spaceX}
            y={this.state.spaceY}
            categories={this.spaceBarCategories()}
          />
        )}
        {selectedNode && (
          <Props
            node={this.nodes(this.state.nodes).find((n) => n.id === selectedNode)}
            onChange={(selected: NodeType) => {
              this.setState((state) => {
                return this.updateNode(state.nodes, selected.id, selected);
              });
              let clones = this.nodes(this.state.nodes).filter((n) => n.clone === selectedNode);
              if (clones.length) {
                this.setState((state) => {
                  return updateClonedNodesNames({
                    nodes: state.nodes,
                    ids: clones.map((c) => c.id),
                    name: selected.name
                  });
                });
              }
            }}
            canExpand={!!this.state.selected}
            canShrink={!this.state.selected && this.state.path.length > 1}
            onExpand={() => {
              this.expandNode(selectedNode);
            }}
            onShrink={() => {
              this.shrinkNode(this.state.expand);
            }}
          />
        )}
      </div>
    );
  }
}
