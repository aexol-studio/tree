import { DiagramTheme } from "../Models";
import { Colors } from "./Colors";

export const DefaultDiagramTheme: DiagramTheme = {
  node: {
    width: 180,
    height: 100,
    nameSize: 24,
    typeSize: 20
  },
  description: {
    width: 300,
    height: 120,
    triangleHeight: 20,
    triangleWidth: 20
  },
  port: {
    width: 40
  },
  link: {
    cornerRadius: 5,
    defaultCenterPoint: 0.5,
    strokeWidth: 4
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
      }
    },
    description: {
      background: Colors.grey[7],
      text: Colors.grey[1]
    },
    port: {
      background: Colors.grey[4],
      backgroundActive: Colors.grey[3],
      button: Colors.grey[0]
    },
    link: {
      main: Colors.grey[3],
      active: Colors.green[0]
    }
  }
};
