import { DiagramTheme } from "../Models";
import { Colors } from "./Colors";

export const DefaultDiagramTheme: DiagramTheme = {
  node: {
    width: 180,
    height: 100,
    nameSize: 24,
    typeSize: 20
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
    port: {
      background: Colors.grey[4],
      backgroundActive: Colors.grey[3]
    },
    link: {
      main: Colors.grey[3],
      active: Colors.green[0]
    }
  }
};
