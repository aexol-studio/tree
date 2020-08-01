import { Node, DiagramTheme, UIState } from "@models";
import {
  ConfigurationManager,
  DiagramDrawingDistanceOptions,
} from "@configuration";
import { StateManager } from "@diagram/stateManager";
import { CSSMiniEngine, css } from "./CssMiniEngine";
import { ScreenPosition } from "@io";
export class NodeRenderer {
  distances: DiagramDrawingDistanceOptions;

  constructor(
    private theme: DiagramTheme,
    private stateManager: StateManager,
    private cssMiniEngine: CSSMiniEngine
  ) {
    this.distances = ConfigurationManager.instance.getOption(
      "drawingDistance"
    ) as DiagramDrawingDistanceOptions;
    this.cssMiniEngine.addCss(css`
      .Node {
        position: relative;
        width: ${theme.node.width}px;
        background-color: ${theme.colors.node.background};
        border: 1px solid transparent;
        border-radius: 10px;
        transition: border-color 0.25s ease-in-out;
      }
      .Node:hover {
        border: 1px solid ${theme.colors.node.selected};
      }
      .NodeInfo {
        width: ${theme.node.width}px;
        height: 30px;
        margin-top: -30px;
        display: flex;
        position: absolute;
      }
      .NodeName {
        margin-right: 5px;
        color: ${theme.colors.node.name};
        font-size: ${theme.node.nameSize}px;
      }
      .NodeType {
        margin-right: 5px;
        color: ${theme.colors.node.type};
        font-size: ${theme.node.typeSize}px;
      }
      .NodeFields {
        padding: 5px 0;
      }
      .NodeField {
        padding: 5px 10px;
        display: flex;
        align-items: center;
      }
      .AddNodePlus,
      .NodeFieldPlus {
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${theme.colors.port.button};
        width: ${theme.addNode.fontSize}px;
        height: ${theme.addNode.fontSize}px;
      }
      .NodeFieldPlus {
        border-radius: ${theme.addNode.fontSize * 0.7}px;
        border: 1px solid;
        width: ${theme.addNode.fontSize * 1.4}px;
        height: ${theme.addNode.fontSize * 1.4}px;
      }
      .NodeFieldName {
        margin: 0 5px;
        color: ${theme.colors.node.name};
        font-size: ${theme.node.nameSize}px;
      }
      .NodeFieldType {
        color: ${theme.colors.node.type};
        font-size: ${theme.node.typeSize}px;
      }
      .BottomNodeGrid {
        position: absolute;
        display: grid;
        grid-template-columns: 3fr 1fr;
        grid-gap: 10px;
        width: 100%;
        height: ${theme.addNode.fontSize * 2}px;
        bottom: -${theme.addNode.fontSize * 2 + 10}px;
      }
      .AddNode {
        cursor: pointer;
        background: ${theme.colors.addNode.background};
        display: flex;
        padding: 0 10px;
        justify-content: flex-start;
        align-items: center;
        border-radius: 4px;
        border: 1px solid transparent;
        transition: border-color 0.25s ease-in-out;
      }
      .AddNode:hover {
        border-color: ${theme.colors.addNode.hover.borderColor};
      }
      .EditNode:hover {
        border-color: ${theme.colors.addNode.hover.borderColor};
      }
      .AddNodeName {
        color: ${theme.colors.addNode.color};
        font-size: ${theme.addNode.fontSize}px;
        margin-left: 10px;
      }
      .EditNode {
        cursor: pointer;
        display: flex;
        border-radius: 4px;
        justify-content: center;
        align-items: center;
        font-size: ${theme.addNode.fontSize}px;
        color: ${theme.colors.addNode.color};
        background: ${theme.colors.addNode.background};
        border: 1px solid transparent;
        transition: border-color 0.25s ease-in-out;
      }
    `);
  }

  getNodeFont(size: number, weight = "normal") {
    return `${weight} ${size}px ${this.theme.fontFamily}`;
  }
  renderInputs = ({
    inputs,
    node,
    position,
  }: {
    inputs: Node[];
    position: ScreenPosition;
    node: Node;
  }) => {
    const inputCounter = 0;
    return `
    <div class="NodeFields">
      ${inputs
        .map((i) =>
          this.renderInput({
            node: i,
            indent: 0,
            inputCounter,
            position: {
              x: node.x,
              y: position.y + inputCounter * 30,
            },
          })
        )
        .join("")}
    </div>`;
  };
  renderInput = ({
    position,
    node,
    indent,
    inputCounter,
  }: {
    position: ScreenPosition;
    node: Node;
    indent: number;
    inputCounter: number;
  }): string => {
    inputCounter += 1;
    return `
    <div class="NodeField" style="margin-left:${indent * 20}">
      <div 
        class="NodeFieldPlus"
        onclick='graphsource.publish("NodeOpenFieldMenu", {
          io: "i",
          nodeId: "${node.id}",
          position:{
            x:${position.x},
            y:${position.y}
          }
        })'>
        +
      </div>
      <div class="NodeFieldName">
        ${node.name}
      </div> 
      <div class="NodeFieldType">
        ${node.definition.type}
      </div>
  </div>${
    node.inputs
      ?.map((i, index) =>
        this.renderInput({
          node: i,
          indent: indent + 1,
          inputCounter,
          position: {
            x: position.x + indent * 20,
            y: position.y + inputCounter * 30,
          },
        })
      )
      .join("") || ""
  }
    `;
  };
  render = ({
    node,
    uiState,
    isSelected,
    position,
  }: {
    uiState: UIState;
    node: Node;
    position?: ScreenPosition;
    typeIsHovered?: boolean;
    isHovered?: boolean;
    isSelected?: boolean;
    isRenamed?: boolean;
    isNodeMenuOpened?: boolean;
    outputActive?: boolean;
    inputActive?: boolean;
    currentScale?: number;
  }) => {
    if (node.hidden) {
      return "";
    }
    const {
      node: { width },
      port,
    } = this.theme;
    const pos = position || { x: node.x, y: node.y };
    const isReadOnly =
      this.stateManager.pureState().isReadOnly || node.readonly;
    isReadOnly;
    const inputs = node.inputs || [];

    const { scale } = uiState;
    const x = (uiState.panX + pos.x - port.width) / 2.0;
    const y = (uiState.panY + pos.y) / 2.0;
    return `<div 
      class="Node Type-${node.definition.type} Name-${node.name}" style="
      transform: scale(${scale}) translate(${x}px,${y}px);
      width:${width}px;
      ">
        <div class="NodeInfo">
          <div class="NodeName">
            ${node.name}
          </div>
          <div class="NodeType">
            ${node.definition.type}
          </div>
        </div>
        ${this.renderInputs({
          inputs,
          node,
          position: pos,
        })}
        ${`
            <div class="BottomNodeGrid">
              <div class="AddNode" onclick='graphsource.publish("NodeOpenFieldMenu", {
                  io: "i",
                  nodeId: "${node.id}",
                  position:{
                    x:${pos.x},
                    y:${pos.y}
                  }
                })'>
                <div class="AddNodePlus">+</div>
                <div class="AddNodeName">
                  add field
                </div> 
              </div>
              <div class="EditNode">
                <span>edit</span>
              </div>
            </div>
        `}
      </div>`;
  };
}
