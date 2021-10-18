import { DiagramTheme } from "@/models";
import { Colors } from "./Colors";

export const DefaultDiagramTheme: DiagramTheme = {
  snappingGridSize: 20,
  autoBeuatify: true,
  fontFamily: `'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace`,
  node: {
    width: 280,
    height: 90,
    nameSize: 24,
    typeSize: 20,
    maxCharacters: 12,
    radius: 10,
    typeYGap: 5,
    padding: 50,
    spacing: {
      x: 100,
      y: 80,
    },
    options: {
      fontSize: 18,
      yGap: 5,
    },
  },
  graph: {
    spacing: {
      x: 200,
      y: 250,
    },
  },
  minimap: {
    alpha: 0.8,
    hoverAlpha: 0.9,
    size: 500,
    margin: 20,
  },
  description: {
    width: 400,
    paddingHorizontal: 40,
    paddingVertical: 40,
    fontSize: 24,
    triangleHeight: 10,
    triangleWidth: 40,
    triangleDistance: 40,
    radius: 10,
    lineHeight: 18,
    placeholder: "Put your description here",
  },
  link: {
    cornerRadius: 25,
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
        String: Colors.green[0],
        type: Colors.main[0],
      },
      backgrounds: {
        String: Colors.green[4],
        type: Colors.main[4],
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
