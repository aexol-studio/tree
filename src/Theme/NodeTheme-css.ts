import { css } from "@renderer/CssMiniEngine";
import { Colors } from "./Colors";

export const NodeTheme = css`
  .Node {
    position: relative;
    width: 200px;
    background-color: ${Colors.grey[6]};
    border: 1px solid transparent;
    border-radius: 10px;
    transition: border-color 0.25s ease-in-out;
  }
  .Node:hover {
    border: 1px solid #30ffc8;
  }
  .NodeInfo {
    width: 200px;
    height: 30px;
    margin-top: -30px;
    display: flex;
    position: absolute;
  }
  .NodeName {
    margin-right: 5px;
    color: ${Colors.grey[0]};
    font-size: 12px;
  }
  .NodeType {
    margin-right: 5px;
    color: ${Colors.grey[0]};
    font-size: 10px;
  }
  .NodeFields {
    padding: 5px 0;
  }
  .NodeField {
    padding: 5px 10px;
    display: flex;
    align-items: center;
    position: relative;
  }
  .AddNodePlus,
  .NodeFieldPlus {
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${Colors.grey[0]};
    width: 12px;
    height: 12px;
  }
  .NodeFieldPlus {
    cursor: pointer;
    opacity: 0;
    border-radius: 8.399999999999999px;
    border: 1px solid;
    width: 16.799999999999997px;
    height: 16.799999999999997px;
    transition: opacity 0.25s ease-in-out;
  }
  .NodeField:hover > .NodeFieldPlus {
    opacity: 0.5;
  }

  .NodeFieldPlus:hover {
    opacity: 1 !important;
  }
  .NodeFieldName {
    margin: 0 5px;
    color: ${Colors.grey[0]};
    font-size: 12px;
  }
  .NodeFieldType {
    color: ${Colors.grey[0]};
    font-size: 10px;
  }
  .NodeField:hover > .NodeFieldNode {
    display: block;
  }
  .NodeFieldNode {
    position: absolute;
    display: none;
    margin-left: -180px;
  }
  .BottomNodeGrid {
    opacity: 0;
    position: absolute;
    display: grid;
    grid-template-columns: 3fr 1fr;
    grid-gap: 10px;
    width: 100%;
    height: 44px;
    bottom: -44px;
    padding: 10px 0;
    transition: opacity 0.25s ease-in-out;
  }
  .Node:hover > .BottomNodeGrid {
    opacity: 1;
  }
  .AddNode {
    cursor: pointer;
    background: ${Colors.blue[8]};
    display: flex;
    padding: 0 10px;
    justify-content: flex-start;
    align-items: center;
    border-radius: 4px;
    border: 1px solid transparent;
    transition: border-color 0.25s ease-in-out;
  }
  .AddNode:hover {
    border-color: #269acc;
  }
  .EditNode:hover {
    border-color: #269acc;
  }
  .AddNodeName {
    color: ${Colors.grey[0]};
    font-size: 12px;
    margin-left: 10px;
  }
  .EditNode {
    cursor: pointer;
    display: flex;
    border-radius: 4px;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: ${Colors.grey[0]};
    background: ${Colors.blue[8]};
    border: 1px solid transparent;
    transition: border-color 0.25s ease-in-out;
  }

  .DiagramHTMLRoot {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
  }
`;
