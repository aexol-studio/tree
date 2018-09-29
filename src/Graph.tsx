import * as React from 'react';
import * as styles from './style/Graph';
import * as cx from 'classnames';
import { SpaceMenu, ContextMenu } from './menu';
import {
  NodeType,
  GraphProps,
  GraphState,
  GraphInitialState,
  Action,
  PortType,
  GraphDeleteNode,
  ActionCategory,
  Snapshot,
  GraphUndo,
  GraphSnapshot,
  LinkType,
  MAIN_TAB_NAME,
  GraphAutoPosition,
  GraphValidate,
  GraphScale,
  GraphDrawConnectors,
  GraphMoveNodes
} from './types';
import { Node, Port, Props, LinkWidget, Background, MiniMap, Search, Tabs, ForceDirected } from '.';
import { generateId, deepNodesUpdate, treeSelection, graphSelection } from './utils';
import { renderLinks } from './render';
import { Basic, Move, Connect } from './cursors';
import { addEventListeners } from './Events';
import { ZoomPanManager } from './ZoomPan';

export class Graph extends React.Component<GraphProps, GraphState> {
  background: HTMLDivElement;
  zoomPan: ZoomPanManager;
  past: Snapshot[] = [
    {
      nodes: [],
      links: []
    }
  ];
  future: Snapshot[] = [];
  state: GraphState = {
    ...GraphInitialState
  };
  get p() {
    const { x, y, endX, endY } = this.state.activePort;
    return {
      start: {
        x: this.oX(x),
        y: this.oY(y)
      },
      end: {
        x: this.oX(endX),
        y: this.oY(endY)
      }
    };
  }

  constructor(props) {
    super(props);
    this.zoomPan = new ZoomPanManager();
  }

  componentDidMount() {
    addEventListeners({
      deleteNodes: this.deleteNodes,
      stateUpdate: (func) => {
        this.setState((state) => func(state));
      },
      whereToRun: this.background,
      copyNode: this.cloneNode,
      undo: this.undo,
      redo: this.redo,
      snapshot: this.snapshot,
      autoPosition: this.autoPosition,
      validate: this.validate,
      scale: this.scale,
      pan: this.zoomPan.panBy,
      drawConnectors: this.drawConnectors,
      moveNodes: this.moveNodes,
    });

    if (this.props.preventOverscrolling) {
      document.body.classList.add(styles.BodyWithoutOverscrolling);
    }
  }

  componentDidUpdate(prevProps: GraphProps, prevState: GraphState) {
    if (prevState.nodes !== this.state.nodes || prevState.links !== this.state.links) {
      this.serialize();
    }
  }
  static getDerivedStateFromProps(
    nextProps: GraphProps,
    prevState: GraphState
  ): Partial<GraphState> {
    if (nextProps.loaded && prevState.loaded !== nextProps.loaded) {
      return {
        loaded: nextProps.loaded,
        nodes: nextProps.loaded.nodes,
        tabs: nextProps.loaded.tabs || prevState.tabs,
        links: nextProps.loaded.links
      };
    }
    return null;
  }

  drawConnectors: GraphDrawConnectors = (mouseX: number, mouseY: number) => {
    const position = this.zoomPan.getPosition();
    const scale = this.zoomPan.getScale();
    this.setState({
      activePort: {
        ...this.state.activePort,
        endX: (mouseX - position.x) / scale,
        endY: (mouseY - position.y) / scale
      }
    })
  };

  moveNodes: GraphMoveNodes = (mouseX: number, mouseY: number) => {
    const scale = this.zoomPan.getScale();

    this.setState({
      ...deepNodesUpdate({
        nodes: this.state.nodes,
        updated: this.state.activeNodes.map((n) => ({
          id: n.id,
          node: {
            x: mouseX / scale + n.x,
            y: mouseY / scale + n.y
          }
        }))
      }),
      activeNodes: this.state.activeNodes.map((n) => ({
        ...n,
        x: n.x + mouseX / scale,
        y: n.y + mouseY / scale
      }))
    });
  };

  scale: GraphScale = (delta: number, x: number, y: number) => {
    const newScale = this.zoomPan.zoomChanged(delta, x, y);
    this.setState({
      scale: newScale
    });
  };

  autoPosition: GraphAutoPosition = () => {
    const forceDirect = new ForceDirected(this.state.nodes, this.state.links);
    forceDirect.simulateRec((nodes) => {
      this.setState({
        nodes
      });
    });
  };
  validate: GraphValidate = () => {
    let invalidNodes: { id: string; node: Partial<NodeType> }[] = [];
    for (const node of this.state.nodes) {
      if (node.clone && !this.state.nodes.find((n) => n.id === node.clone)) {
        invalidNodes.push({
          id: node.id,
          node: {
            invalid: true
          }
        });
      }
      for (const node2 of this.state.nodes) {
        if (this.props.validate) {
          const valid = this.props.validate(node, node2);
          if (!valid) {
            invalidNodes.push({
              id: node.id,
              node: {
                invalid: true
              }
            });
            invalidNodes.push({
              id: node2.id,
              node: {
                invalid: true
              }
            });
          }
        }
      }
    }
    invalidNodes = invalidNodes.filter(
      (n, i) => i === invalidNodes.findIndex((inode) => inode.id === n.id)
    );
    this.setState((state) => ({
      ...deepNodesUpdate({ nodes: state.nodes, updated: invalidNodes })
    }));
  };
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
  deleteLinks = (): { links: LinkType[] } => {
    let links = [...this.state.links];
    this.state.activeNodes.map((node) => {
      let deletedNodes = this.nodes(this.state.activeNodes).map((n) => n.id);
      links = links.filter(
        (l) => !deletedNodes.includes(l.from.nodeId) && !deletedNodes.includes(l.to.nodeId)
      );
    });
    return { links };
  };
  deleteNodes: GraphDeleteNode = () => {
    const allNodes = this.nodes(this.state.nodes);
    const nodes = allNodes
      .filter((n) => this.state.activeNodes.find((an) => an.id === n.clone))
      .concat(this.state.activeNodes);
    const deletedNodes = deepNodesUpdate({
      nodes: this.state.nodes,
      updated: nodes.map((n) => ({
        id: n.id,
        node: {}
      })),
      remove: true
    });

    return {
      ...deletedNodes,
      ...this.deleteLinks(),
      renamed: null,
      activeNodes: []
    };
  };
  bX = (x: number): number => -x + this.background.offsetLeft + this.background.offsetWidth;
  bY = (y: number): number => -y + this.background.offsetTop + this.background.offsetHeight;
  aX = (x: number): number => x + this.background.offsetLeft;
  aY = (y: number): number => y + this.background.offsetTop;
  oX = (x: number): number => x - this.background.offsetLeft;
  oY = (y: number): number => y - this.background.offsetTop;
  addNode = (node: NodeType) => {
    this.snapshot('past', 'future');
    this.setState((state) => {
      const { expand, nodes, spaceX, spaceY, pan, scale, activeTab } = state;
      let newNode: NodeType = {
        id: generateId(),
        x: (spaceX - pan.x) / scale,
        y: (spaceY - pan.y) / scale,
        nodes: [],
        tab: activeTab,
        ...node
      };
      let updateNodes: any = {
        activeNodes: [newNode],
        renamed: true,
        action: Action.SelectedNode
      };
      if (expand) {
        const oldNodeNodes = this.nodes(nodes).find((n) => n.id === expand.id).nodes;
        updateNodes = {
          ...updateNodes,
          ...deepNodesUpdate({
            nodes,
            updated: [
              {
                id: expand.id,
                node: {
                  nodes: [...oldNodeNodes, newNode]
                }
              }
            ]
          })
        };
      } else {
        updateNodes = {
          ...updateNodes,
          nodes: [...state.nodes, newNode]
        };
      }
      return updateNodes;
    });
  };
  cloneNode = () => {
    if (!this.state.activeNodes.length) {
      return;
    }
    this.state.activeNodes.map((node) => {
      const panPosition = this.zoomPan.getPosition();
      const scale = this.zoomPan.getScale();
      this.addNode({
        ...node,
        id: generateId(),
        inputs: node.inputs.map((i) => ({ ...i, id: generateId() })),
        outputs: node.outputs.map((i) => ({ ...i, id: generateId() })),
        x: (this.state.mouseX - panPosition.x) / scale,
        y: (this.state.mouseY - panPosition.y) / scale
      });
    });
  };
  reset = (updateState = {}) => {
    this.setState({
      action: Action.Nothing,
      activePort: null,
      contextMenuActive: false,
      activeNodes: [],
      renamed: false,
      ...updateState
    });
  };
  portDown = (x: number, y: number, portId: string, id: string, output: boolean) => {
    const panPosition = this.zoomPan.getPosition();
    const scale = this.zoomPan.getScale();

    const startX = (x - panPosition.x) / scale;
    const startY = (y - panPosition.y) / scale;
    this.setState({
      action: Action.ConnectPort,
      activePort: {
        x: startX,
        y: startY,
        id,
        portId,
        output,
        endX: startX,
        endY: startY
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
    let from = activePort.output ? ports[0] : ports[1];
    let to = activePort.output ? ports[1] : ports[0];
    if (this.state.links.find((l) => l.from.portId === from.portId && l.to.portId === to.portId)) {
      this.reset();
      return;
    }
    if (activePort && activePort.portId !== portId) {
      if (activePort.output === output) {
        this.reset();
        return;
      }
      const allNodes = this.nodes(this.state.nodes);
      const port = allNodes
        .find((n) => n.id === (activePort.output ? id : activePort.id))
        .inputs.find((p) => p.id === (activePort.output ? portId : activePort.portId));
      const node = allNodes.find((n) => n.id === (!activePort.output ? id : activePort.id));

      if (port.accepted && port.accepted.length > 0) {
        let accepted = false;
        for (var a of port.accepted) {
          let isAccepted = false;
          if (a.node) {
            if (a.node.type) {
              if (a.node.type === node.type) {
                isAccepted = true;
              }
            }
            if (a.node.subType) {
              if (a.node.subType === node.subType) {
                isAccepted = true;
              } else {
                isAccepted = false;
              }
            }
            if (a.node.kind) {
              if (a.node.kind === node.kind) {
                isAccepted = true;
              } else {
                isAccepted = false;
              }
            }
          }
          if (isAccepted) {
            accepted = true;
          }
        }
        if (!accepted) {
          this.reset();
          return;
        }
      }

      this.snapshot('past', 'future');
      this.reset({
        links: [
          ...this.state.links,
          {
            from,
            to
          }
        ]
      });
    } else {
      this.setState({
        activePort: null,
        action: Action.Nothing
      });
    }
  };
  updatePortPositions = (x, y, portId, id, output: boolean) => {
    this.setState((state) => {
      const modifyState = (portMode: 'inputs' | 'outputs') => {
        let n = this.nodes(state.nodes).find((n) => n.id === id);
        let ports = n[portMode].map((p) => (p.id === portId ? { ...p, x, y } : p));
        return deepNodesUpdate({
          nodes: state.nodes,
          updated: [
            {
              id,
              node: {
                [portMode]: ports
              }
            }
          ]
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
        className={styles.Expand}
        style={{
          pointerEvents: 'none'
        }}
      >
        <div className={styles.Inputs}>{this.renderMainPorts(node, inputs, false)}</div>
        <div className={styles.Outputs}>{this.renderMainPorts(node, outputs, true)}</div>
      </div>
    );
  };
  treeSelect = () => {
    const nodes = this.nodes(this.state.nodes);
    let activeNodes = this.state.activeNodes
      .map((n) => treeSelection(n, nodes, this.state.links))
      .reduce((a, b) => [...a, ...b]);
    activeNodes.filter((a, i) => activeNodes.findIndex((an) => an.id === a.id) === i);
    this.setState({
      activeNodes
    });
  };
  graphSelect = () => {
    const nodes = this.nodes(this.state.nodes);
    let activeNodes = this.state.activeNodes
      .map((n) => graphSelection(n, nodes, this.state.links))
      .reduce((a, b) => [...a, ...b]);
    activeNodes.filter((a, i) => activeNodes.findIndex((an) => an.id === a.id) === i);
    this.setState({
      activeNodes
    });
  };
  selectNodes = (node) => {
    const alreadyHaveNode = !!this.state.activeNodes.find((n) => n.id === node.id);
    if (alreadyHaveNode && !this.state.ctrlPressed) {
      return {
        action: Action.SelectedNode,
        renamed: this.state.activeNodes.length === 1
      };
    }
    let activeNodes = [node];
    if (this.state.ctrlPressed) {
      if (alreadyHaveNode) {
        activeNodes = this.state.activeNodes.filter((n) => n.id !== node.id);
      } else {
        activeNodes = [...this.state.activeNodes, ...activeNodes];
      }
    }
    return {
      action: Action.SelectedNode,
      activeNodes,
      renamed: activeNodes.length === 1
    };
  };
  renderNodes = (nodes: Array<NodeType>) => {
    const expandId = this.state.expand ? this.state.expand.id : null;
    return nodes.filter((node) => node.id !== expandId).map((node) => (
      <Node
        {...node}
        key={node.id}
        portDown={this.portDown}
        portUp={this.portUp}
        renamed={this.state.renamed}
        portPosition={(x, y, portId, id, output) => {
          this.updatePortPositions(x, y, portId, id, output);
        }}
        nodeDown={(id: string, x: number, y: number) => {
          if (this.state.altPressed) {
            this.goToDefinition(node);
            return;
          }
          this.setState(this.selectNodes(node));
        }}
        contextMenu={(id: string, x: number, y: number) => {
          if (this.state.activeNodes.length > 0) {
            this.setState({
              ...this.selectNodes(node),
              contextMenuActive: true,
              contextX: this.state.mouseX,
              contextY: this.state.mouseY
            });
          }
        }}
        nodeUp={(id: string) => {
          this.setState({
            action: Action.SelectedNode,
            activePort: null
          });
        }}
      />
    ));
  };
  expandNode = (selectedNode: NodeType) => {
    this.setState((state) => ({
      expand: selectedNode,
      path: [...state.path, selectedNode.id],
      activeNodes: []
    }));
  };
  shrinkNode = (selectedNode: NodeType) => {
    let path = this.state.path;
    path.pop();
    let expand = path[path.length - 1];
    this.setState({
      expand: this.nodes(this.state.nodes).find((n) => n.id === expand),
      path,
      activeNodes: [selectedNode]
    });
  };
  centerNode = (n: NodeType) => {
    this.zoomPan.panTo(
      -n.x * this.zoomPan.getScale() + this.background.clientWidth / 2.0,
      -n.y * this.zoomPan.getScale() + this.background.clientHeight / 2.0
    );

    this.setState({
      activeNodes: [n]
    });
  };
  goToDefinition = (n: NodeType) => {
    if (n.clone) {
      const definitionNode = this.state.nodes.find((no) => no.id === n.clone);
      if (definitionNode) {
        this.centerNode(definitionNode);
      }
    }
  };
  spaceBarCategories = (): Array<ActionCategory> => {
    const { categories } = this.props;
    let spaceBarCategories = [...categories];
    return spaceBarCategories;
  };
  serialize = () => {
    const { serialize } = this.props;
    if (serialize) {
      serialize(this.nodes(this.state.nodes), this.state.links, this.state.tabs);
    }
  };
  load = () => {
    const { load } = this.props;
    if (load) {
      this.setState({
        nodes: load()
      });
      console.log('LOADING');
    }
  };
  snapshot: GraphSnapshot = (where, clear?) => {
    if (clear) {
      delete this[clear];
      this[clear] = [];
    }
    this.setState((state) => {
      if (this[where].length > 50) {
        this[where].shift();
      }
      this[where].push({
        nodes: state.nodes,
        links: state.links
      });
      return {};
    });
  };
  undo: GraphUndo = () => {
    if (this.past.length > 1) {
      const oldState = this.past.pop();
      this.snapshot('future');
      this.setState((state) => ({
        ...oldState
      }));
    }
  };
  redo: GraphUndo = () => {
    if (this.future.length > 0) {
      const newState = this.future.pop();
      this.snapshot('past');
      this.setState((state) => ({
        ...newState
      }));
    }
  };
  nodeCategory = () => {
    let category: ActionCategory = {
      name: 'node',
      items:
        this.state.activeNodes.length > 0
          ? [
            {
              name: 'delete',
              action: () => {
                this.snapshot('past', 'future');
                this.setState((state) => ({
                  ...this.deleteNodes(),
                  contextMenuActive: false
                }));
              }
            },
            {
              name: 'unlink',
              action: () => {
                this.snapshot('past', 'future');
                this.setState((state) => ({
                  ...this.deleteLinks(),
                  contextMenuActive: false
                }));
              }
            },
            {
              name: 'duplicate',
              action: () => {
                this.cloneNode();
                this.setState((state) => ({
                  contextMenuActive: false
                }));
              }
            },
            {
              name: 'treeSelect',
              action: () => {
                this.treeSelect();
                this.setState((state) => ({
                  contextMenuActive: false
                }));
              }
            },
            {
              name: 'graphSelect',
              action: () => {
                this.graphSelect();
                this.setState((state) => ({
                  contextMenuActive: false
                }));
              }
            },
            {
              name: 'optional',
              action: () => {
                this.setState((state) => ({
                  ...deepNodesUpdate({
                    nodes: this.nodes(state.nodes),
                    updated: this.state.activeNodes.map((n) => ({
                      id: n.id,
                      node: {
                        required: false
                      } as Partial<NodeType>
                    }))
                  }),
                  contextMenuActive: false
                }));
              }
            },
            {
              name: 'required',
              action: () => {
                this.setState((state) => ({
                  ...deepNodesUpdate({
                    nodes: this.nodes(state.nodes),
                    updated: this.state.activeNodes.map((n) => ({
                      id: n.id,
                      node: {
                        required: true
                      } as Partial<NodeType>
                    }))
                  }),
                  contextMenuActive: false
                }));
              }
            }
          ]
          : this.state.expand
            ? [
              {
                name: 'back',
                action: () => {
                  this.shrinkNode(this.state.expand);
                  this.setState((state) => ({
                    contextMenuActive: false
                  }));
                }
              }
            ]
            : []
    };
    if (this.state.activeNodes.length === 1) {
      const [activeNode] = this.state.activeNodes;
      category = {
        ...category,
        items: [
          ...category.items
          // {
          //   name: 'expand',
          //   action: () => {
          //     this.expandNode(activeNode);
          //   }
          // }
        ]
      };
      if (activeNode.items) {
        category = {
          ...category,
          items: [...category.items, ...activeNode.items]
        };
      }
    }
    return category;
  };
  //Small util to dedupe unwanted links
  dedupeLinks = () => {
    this.setState({
      links: this.state.links.filter(
        (l, i) =>
          i ===
          this.state.links.findIndex(
            (link) => link.from.portId === l.from.portId && link.to.portId === l.to.portId
          )
      )
    });
  };

  render() {
    let { nodes, expand, links, renamed, pan, scale, activeTab } = this.state;
    let selectedNode = this.state.activeNodes || [this.state.expand];
    if (expand) {
      nodes = this.nodes(nodes);
      nodes = expand.nodes;
      nodes = nodes || [];
      nodes = [...nodes, { ...expand, x: this.aX(0), y: this.aY(0) }];
    }
    nodes = nodes.filter((n) => (n.tab ? n.tab === activeTab : activeTab === MAIN_TAB_NAME));
    links = links.filter(
      (l) => nodes.find((n) => n.id === l.from.nodeId) && nodes.find((n) => n.id === l.to.nodeId)
    );
    nodes = nodes.map((n) => ({
      ...n,
      tab: n.tab || MAIN_TAB_NAME,
      inputs: n.inputs.map((i) => ({
        ...i,
        connected: !!links.find((l) => l.from.portId === i.id || l.to.portId === i.id)
      })),
      outputs: n.outputs.map((i) => ({
        ...i,
        connected: !!links.find((l) => l.from.portId === i.id || l.to.portId === i.id)
      })),
      selected: !!this.state.activeNodes.find((node) => n.id === node.id)
    }));

    return (
      <Background
        onRef={(ref) => (this.background = ref)}
        reset={this.reset}
        switchAction={(action: Action) => {
          this.setState({
            action
          });
        }}
      >
        <div
          className={cx(styles.Nodes, { [styles.NodesZooming]: this.state.action !== Action.Pan })}
          ref={this.zoomPan.registerContainerElement}
        >
          {this.renderNodes(nodes)}
          {expand && this.renderExpandedNodePorts(expand)}
          <svg className={styles.SVG}>
            {this.state.activePort && <LinkWidget {...this.p} />}
            {renderLinks(links, nodes, this.oX, this.oY, selectedNode)}
          </svg>
        </div>
        {nodes.length === 0 && (
          <div className={styles.HelperScreen}>
            <div className={styles.HelperPhrase}>Press and hold spacebar to add new nodes</div>
          </div>
        )}
        {this.state.spacePressed && (
          <SpaceMenu
            x={this.state.spaceX}
            y={this.state.spaceY}
            categories={this.spaceBarCategories()}
            addNode={(i: NodeType) => {
              return () =>
                this.addNode({
                  ...i,
                  id: generateId(),
                  inputs: i.inputs.map((input) => ({ ...input, id: generateId() })),
                  outputs: i.outputs.map((output) => ({ ...output, id: generateId() }))
                });
            }}
          />
        )}
        {this.state.contextMenuActive && (
          <ContextMenu
            x={this.state.contextX}
            y={this.state.contextY}
            addNode={(i: NodeType) => {
              return () =>
                this.addNode({
                  ...i,
                  id: generateId(),
                  inputs: i.inputs.map((input) => ({ ...input, id: generateId() })),
                  outputs: i.outputs.map((output) => ({ ...output, id: generateId() }))
                });
            }}
            category={this.nodeCategory()}
          />
        )}
        {this.state.searchMenuActive && (
          <Search
            nodes={nodes}
            onSearch={(n) => {
              if (n) {
                this.centerNode(n);
              }
            }}
          />
        )}
        {selectedNode &&
          selectedNode.length === 1 &&
          renamed && (
            <Props
              canBlurFocus={this.state.action === Action.SelectedNode}
              node={selectedNode[0]}
              onChange={(selected: NodeType) => {
                const clones = this.nodes(this.state.nodes).filter(
                  (n) => n.clone === selectedNode[0].id
                );
                this.setState((state) => ({
                  ...deepNodesUpdate({
                    nodes: state.nodes,
                    updated: [...clones]
                      .map((n) => ({
                        id: n.id,
                        node: { kind: selected.name, name: n.name, type: n.type }
                      }))
                      .concat([
                        {
                          id: selected.id,
                          node: { name: selected.name, type: selected.type, kind: selected.kind }
                        }
                      ])
                  }),
                  activeNodes: [selected]
                }));
              }}
              canExpand={this.state.activeNodes.length === 1}
              canShrink={!this.state.activeNodes.length && this.state.path.length > 1}
              onExpand={() => {
                this.expandNode(selectedNode[0]);
              }}
              onShrink={() => {
                this.shrinkNode(this.state.expand);
              }}
            />
          )}
        {
          {
            [Action.Nothing]: <Basic x={this.state.mouseX} y={this.state.mouseY} />,
            [Action.SelectedNode]: <Basic x={this.state.mouseX} y={this.state.mouseY} />,
            [Action.MoveNode]: <Move x={this.state.mouseX} y={this.state.mouseY} />,
            [Action.Pan]: <Move x={this.state.mouseX} y={this.state.mouseY} />,
            [Action.ConnectPort]: <Connect x={this.state.mouseX} y={this.state.mouseY} />
          }[this.state.action]
        }
        {nodes.length > 1 && (
          <MiniMap
            height={200}
            width={200}
            scale={scale}
            nodes={nodes}
            pan={pan}
            graphWidth={this.background ? this.background.clientWidth : 1}
            graphHeight={this.background ? this.background.clientHeight : 1}
          />
        )}
        <Tabs
          addTab={(name: string) => {
            if (!this.state.tabs.includes(name)) {
              this.setState({
                tabs: [...this.state.tabs, name]
              });
            }
          }}
          removeTab={(name: string) => {
            if (this.state.tabs.includes(name)) {
              this.setState({
                tabs: this.state.tabs.filter((t) => t !== name),
                activeTab:
                  this.state.activeTab === name ? this.state.tabs[0] : this.state.activeTab,
                nodes: this.state.nodes.filter((n) => n.tab !== name)
              });
            }
          }}
          renameTab={(name: string, newName: string) => {
            if (this.state.tabs.includes(name)) {
              this.setState({
                tabs: this.state.tabs.map((t) => (t === name ? newName : t)),
                activeTab: newName,
                nodes: this.state.nodes.map((n) => (n.tab === name ? { ...n, tab: newName } : n))
              });
            }
          }}
          onSelect={(name: string) => {
            if (this.state.tabs.includes(name)) {
              this.setState({
                activeTab: name
              });
            }
          }}
          tabs={this.state.tabs}
          tab={this.state.activeTab}
        />
      </Background>
    );
  }
}
