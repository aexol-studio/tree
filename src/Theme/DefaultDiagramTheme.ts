import { DiagramTheme } from "@models";
import { Colors } from "./Colors";

export const DefaultDiagramTheme: DiagramTheme = {
  snappingGridSize: 20,
  autoBeuatify: true,
  fontFamily: `'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace`,
  node: {
    width: 300,
    height: 110,
    nameSize: 24,
    typeSize: 20,
    maxCharacters: 12,
    spacing: {
      x: 100,
      y: 100,
    },
    options: {
      fontSize: 18,
    },
  },
  graph: {
    spacing: {
      x: 300,
      y: 350,
    },
  },
  minimap: {
    alpha: 0.8,
    hoverAlpha: 0.9,
    size: 500,
    margin: 20,
  },
  description: {
    width: 200,
    paddingHorizontal: 20,
    paddingVertical: 20,
    fontSize: 12,
    triangleHeight: 10,
    triangleWidth: 10,
    triangleDistance: 20,
    lineHeight: 18,
    placeholder: "Put your description here",
  },
  link: {
    cornerRadius: 5,
    defaultCenterPoint: 0.5,
    strokeWidth: 3,
  },
  help: {
    lineHeight: 21,
    text: 14,
    padding: 20,
    title: {
      text: 14,
    },
  },
  colors: {
    background: Colors.grey[8],
    node: {
      background: Colors.grey[6],
      selected: Colors.green[0],
      name: Colors.grey[0],
      type: Colors.grey[0],
      types: {
        string: Colors.green[0],
        type: Colors.main[0],
      },
      options: {
        required: Colors.red[0],
        array: Colors.yellow[0],
      },
      hover: {
        type: Colors.yellow[0],
      },
      menuOpened: Colors.red[0],
    },
    minimap: {
      background: Colors.grey[7],
      visibleArea: Colors.grey[5],
      node: Colors.grey[0],
      borders: Colors.grey[4],
    },
    description: {
      background: Colors.grey[9],
      text: Colors.grey[1],
    },
    link: {
      main: Colors.grey[3],
      hover: Colors.yellow[0],
      active: Colors.green[0],
    },
    help: {
      background: Colors.grey[7],
      text: Colors.grey[2],
      title: Colors.main[0],
    },
  },
};
