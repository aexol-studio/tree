import { Node, DiagramTheme, UIState } from "@models";
import {
  ConfigurationManager,
  DiagramDrawingDistanceOptions,
} from "@configuration";
import { StateManager } from "@diagram/stateManager";
import { CSSMiniEngine, css } from "./CssMiniEngine";
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
        margin-top: -${theme.node.nameSize * 1.5}px;
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
        font-size: ${theme.node.nameSize}px;
      }
      .NodeField {
        width: 100%;
        display: flex;
      }
      .NodeFieldCreate {
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${theme.colors.port.button};
        width: ${theme.node.nameSize}px;
        height: ${theme.node.nameSize}px;
        margin-right: ${theme.port.gap}px;
      }
      .NodeFieldName {
        margin-right: 5px;
        color: ${theme.colors.node.name};
        font-size: ${theme.node.nameSize}px;
      }
      .NodeFieldType {
        color: ${theme.colors.node.type};
        font-size: ${theme.node.typeSize}px;
      }
      .AddNode {
        position: absolute;
        bottom: -${theme.node.nameSize * 1.5}px;
      }
    `);
  }

  getNodeFont(size: number, weight = "normal") {
    return `${weight} ${size}px ${this.theme.fontFamily}`;
  }
  render = ({
    node,
    uiState,
    isSelected,
  }: {
    uiState: UIState;
    node: Node;
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
    if (!node.inputs?.length && !!node.outputs?.length) {
      return "";
    }
    const {
      node: { width, height: nodeHeight },
      port,
    } = this.theme;
    const height = nodeHeight * (node.inputs?.length || 1);
    const isReadOnly =
      this.stateManager.pureState().isReadOnly || node.readonly;
    isReadOnly;
    const inputs = node.inputs || [];

    const { scale } = uiState;
    const x = (uiState.panX + node.x - port.width) / 2.0;
    const y = (uiState.panY + node.y) / 2.0;
    return `<div 
      class="Node Type-${node.definition.type} Name-${node.name}" style="
      transform: scale(${scale}) translate(${x}px,${y}px);
      height:${height}px;
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
        <div class="NodeFields">
        ${inputs
          .map(
            (i) => `
        <div class="NodeField">
          <div class="NodeFieldCreate">
            +
          </div>
          <div class="NodeFieldName">
            ${i.name}
          </div> 
          <div class="NodeFieldType">
            ${i.definition.type}
          </div>
        </div>
        `
          )
          .join("")}
        </div>
        ${
          isSelected
            ? `<div class="AddNode">
          <div class="NodeField">
            <div class="NodeFieldCreate">
              +
            </div>
            <div class="NodeFieldName">
              add field
            </div> 
          </div>
        </div>`
            : ""
        }
      </div>`;
  };
}
