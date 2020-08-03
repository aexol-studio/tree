import { Node, DiagramTheme } from "@models";
import {
  ConfigurationManager,
  DiagramDrawingDistanceOptions,
} from "@configuration";
import { StateManager } from "@diagram/stateManager";
import { CSSMiniEngine } from "./CssMiniEngine";
import { ScreenPosition } from "@io";
import { NodeTheme } from "@theme/NodeTheme-css";
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
    this.cssMiniEngine.addCss(NodeTheme);
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
    isSelected,
    position,
  }: {
    node: Node;
    position?: ScreenPosition;
    isSelected?: boolean;
    isRenamed?: boolean;
    isNodeMenuOpened?: boolean;
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

    const x = pos.x - port.width;
    const y = pos.y;
    return `<div 
      data-graphsouce-node="${node.id}"
      class="Node Type-${node.definition.type} Name-${node.name}" style="
      transform:  translate(${x}px,${y}px);
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
