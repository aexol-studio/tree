import { DiagramTheme } from "@models";
import { Colors } from "./Colors";

export const DefaultDiagramTheme: DiagramTheme = {
  snappingGridSize: 20,
  autoBeuatify: true,
  fontFamily: `'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace`,
  node: {
    width: 200,
    height: 110,
    nameSize: 12,
    typeSize: 10,
    maxCharacters: 12,
    spacing: {
      x: 100,
      y: 100,
    },
    options: {
      fontSize: 10,
    },
  },
  addNode: {
    fontSize: 12,
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
  port: {
    width: 50,
    gap: 2,
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
  menu: {
    width: 200,
    maxWidth: 300,
    maxHeight: 300,
    padding: `15px`,
    borderRadius: `0px`,
    category: {
      padding: `5px`,
      fontSize: `11px`,
      fontWeight: `normal`,
    },
    title: {
      fontSize: "10px",
      fontWeight: "bold",
    },
    spacing: {
      x: 20,
      y: 10,
    },
  },
  colors: {
    addNode: {
      background: Colors.blue[8],
      color: Colors.grey[0],
      hover: {
        borderColor: Colors.blue[2],
      },
    },
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
    port: {
      background: Colors.grey[5],
      backgroundActive: Colors.grey[4],
      button: Colors.grey[0],
    },
    link: {
      main: Colors.grey[3],
      hover: Colors.yellow[0],
      active: Colors.green[0],
    },
    menu: {
      background: "#151515",
      text: Colors.grey[3],
      hover: Colors.grey[1],
      title: Colors.grey[4],
    },
    help: {
      background: Colors.grey[7],
      text: Colors.grey[2],
      title: Colors.main[0],
    },
  },
};
