import { DiagramTheme } from "../Models";
import { Colors } from "./Colors";

export const DefaultDiagramTheme: DiagramTheme = {
  snappingGridSize: 20,
  node: {
    width: 180,
    height: 100,
    nameSize: 24,
    typeSize: 20,
    spacing: {
      x: 100,
      y: 100
    },
    options: {
      fontSize: 18
    }
  },
  minimap: {
    alpha: 0.8,
    hoverAlpha: 0.9,
    size: 500,
    margin: 20
  },
  description: {
    width: 400,
    paddingHorizontal: 20,
    paddingVertical: 20,
    fontSize: 24,
    triangleHeight: 20,
    triangleWidth: 20,
    lineHeight: 36
  },
  port: {
    width: 40,
    gap: 2
  },
  link: {
    cornerRadius: 5,
    defaultCenterPoint: 0.5,
    strokeWidth: 4
  },
  help: {
    lineHeight: 42,
    text: 28,
    title: {
      text: 28
    }
  },
  menu: {
    width: 400,
    maxHeight: 700,
    category: {
      height: 50,
      textSize: 25
    },
    spacing: {
      x: 20,
      y: 100
    }
  },
  colors: {
    background: Colors.grey[6],
    node: {
      background: Colors.grey[5],
      selected: Colors.main[3],
      name: Colors.grey[0],
      type: Colors.green[0],
      types: {
        string: Colors.green[0],
        type: Colors.main[0]
      },
      options: {
        required: Colors.red[0],
        array: Colors.yellow[0]
      }
    },
    minimap: {
      background: Colors.grey[7],
      visibleArea: Colors.grey[5],
      node: Colors.grey[0],
      borders: Colors.grey[4]
    },
    description: {
      background: Colors.grey[8],
      text: Colors.grey[1]
    },
    port: {
      background: Colors.grey[5],
      backgroundActive: Colors.grey[4],
      button: Colors.grey[0]
    },
    link: {
      main: Colors.grey[3],
      hover: Colors.yellow[0],
      active: Colors.green[0]
    },
    menu: {
      background: Colors.grey[3],
      text: Colors.grey[6],
      hover: Colors.grey[1]
    },
    help: {
      background: Colors.grey[7],
      text: Colors.grey[2],
      title: Colors.main[0]
    }
  }
};
