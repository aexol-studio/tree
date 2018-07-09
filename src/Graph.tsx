import * as React from 'react';
import * as styles from './style/Graph';
import { SpaceMenu } from './SpaceMenu';
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
  GraphSnapshot
} from './types';
import { Node, Port, Props, LinkWidget, Background, MiniMap } from '.';
import { generateId, deepNodesUpdate, treeSelection, graphSelection } from './utils';
import { renderLinks } from './render';
import { Basic, Move, Connect } from './cursors';
import { addEventListeners } from './Events';
export class Graph extends React.Component<GraphProps, GraphState> {
  background: HTMLDivElement;
  past: Snapshot[] = [
    {
      nodes: [],
      links: []
    }
  ];
  future: Snapshot[] = [];
  state = {
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
  componentDidUpdate(prevProps: GraphProps, prevState: GraphState) {
    if (prevState.nodes !== this.state.nodes || prevState.links !== this.state.links) {
      this.serialize();
    }
  }
  static getDerivedStateFromProps(nextProps: GraphProps, prevState: GraphState) {
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
  deleteLinks = () => {
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
    const deletedNodes = deepNodesUpdate({
      nodes: this.state.nodes,
      updated: this.state.activeNodes.map((n) => ({
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
      snapshot: this.snapshot
    });
  }
  addNode = (node: NodeType) => {
    this.snapshot('past', 'future');
    this.setState((state) => {
      const { expand, nodes, spaceX, spaceY, pan } = state;
      let newNode: NodeType = {
        id: generateId(),
        x: spaceX - pan.x,
        y: spaceY - pan.y,
        nodes: [],
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
      this.addNode({
        ...node,
        id: generateId(),
        inputs: node.inputs.map((i) => ({ ...i, id: generateId() })),
        outputs: node.outputs.map((i) => ({ ...i, id: generateId() })),
        x: this.state.mouseX,
        y: this.state.mouseY
      });
    });
  };
  reset = (updateState = {}) => {
    this.setState({
      action: Action.Nothing,
      activePort: null,
      activeNodes: [],
      renamed: false,
      ...updateState
    });
  };
  portDown = (x: number, y: number, portId: string, id: string, output: boolean) => {
    const startX = x - this.state.pan.x;
    const startY = y - this.state.pan.y;
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
    if (activePort && activePort.portId !== portId) {
      if (activePort.output === output) {
        this.reset();
        return;
      }
      const allNodes = this.nodes(this.state.nodes);
      const port = allNodes
        .find((n) => n.id === (activePort.output ? id : activePort.id))
        .inputs.find((p) => p.id === (activePort.output ? portId : activePort.portId));
      const node = allNodes.find((n) => n.id === (!activePort.output ? portId : activePort.id));

      if (port.accepted && port.accepted.length) {
        console.log(port.accepted);
        let accepted = false;
        for (var a of port.accepted) {
          let isAccepted = false;
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
  renderNodes = (nodes: Array<NodeType>) => {
    const selectNodes = (node, x, y) => {
      const alreadyHaveNode = !!this.state.activeNodes.find((n) => n.id === node.id);
      if (alreadyHaveNode && !this.state.ctrlPressed) {
        this.setState({
          action: Action.SelectedNode,
          renamed: this.state.activeNodes.length === 1
        });
        return;
      }
      let activeNodes = [node];
      if (this.state.ctrlPressed) {
        if (alreadyHaveNode) {
          activeNodes = this.state.activeNodes.filter((n) => n.id !== node.id);
        } else {
          activeNodes = [...this.state.activeNodes, ...activeNodes];
        }
      }
      this.setState({
        action: Action.SelectedNode,
        activeNodes,
        renamed: activeNodes.length === 1
      });
    };
    const expandId = this.state.expand ? this.state.expand.id : null;
    return nodes.filter((node) => node.id !== expandId).map((node) => (
      <Node
        {...node}
        key={node.id}
        id={node.id}
        selected={!!this.state.activeNodes.find((n) => n.id === node.id)}
        portDown={this.portDown}
        portUp={this.portUp}
        portPosition={(x, y, portId, id, output) => {
          this.updatePortPositions(x, y, portId, id, output);
        }}
        nodeDown={(id: string, x: number, y: number) => {
          selectNodes(node, x, y);
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
  spaceBarCategories = (): Array<ActionCategory> => {
    const { categories } = this.props;
    let spaceBarCategories = [...categories];
    if (this.state.activeNodes.length > 0 || this.state.expand) {
      spaceBarCategories = [
        {
          name: 'node',
          items:
            this.state.activeNodes.length > 0
              ? [
                  {
                    name: 'delete',
                    action: () => {
                      this.snapshot('past', 'future');
                      this.setState((state) => ({
                        ...this.deleteNodes()
                      }));
                    }
                  },
                  {
                    name: 'unlink',
                    action: () => {
                      this.snapshot('past', 'future');
                      this.setState((state) => ({
                        ...this.deleteLinks()
                      }));
                    }
                  },
                  {
                    name: 'duplicate',
                    action: () => {
                      this.cloneNode();
                    }
                  },
                  {
                    name: 'treeSelect',
                    action: () => {
                      this.treeSelect();
                    }
                  },
                  {
                    name: 'graphSelect',
                    action: () => {
                      this.graphSelect();
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
      if (this.state.activeNodes.length === 1) {
        spaceBarCategories[0].items = [
          ...spaceBarCategories[0].items,
          {
            name: 'expand',
            action: () => {
              this.expandNode(this.state.activeNodes[0]);
            }
          }
        ];
      }
    }
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
  render() {
    let { nodes, expand, links, renamed, pan } = this.state;
    let selectedNode = this.state.activeNodes || [this.state.expand];
    if (expand) {
      nodes = this.nodes(nodes);
      nodes = expand.nodes;
      nodes = nodes || [];
      nodes = [...nodes, { ...expand, x: this.aX(0), y: this.aY(0) }];
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
          className={styles.Nodes}
          style={{
            top: pan.y,
            left: pan.x,
            position: 'relative'
          }}
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
                    updated: [...clones, selected].map((n) => ({
                      id: n.id,
                      node: { name: selected.name }
                    }))
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
        <MiniMap
          height={200}
          width={200}
          nodes={nodes}
          pan={pan}
          graphWidth={this.background ? this.background.clientWidth : 0}
          graphHeight={this.background ? this.background.clientHeight : 0}
        />
      </Background>
    );
  }
}
