import { DiagramTheme } from "../Models";
import { DefaultDiagramTheme } from "./DefaultDiagramTheme";
import { Colors } from "./ColorsLight";

export const DefaultDiagramThemeLight: DiagramTheme = {
  ...DefaultDiagramTheme,
  colors: {
    background: Colors.grey[1],
    node: {
      background: Colors.grey[2],
      selected: Colors.green[0],
      name: Colors.grey[5],
      type: Colors.grey[5],
      types: {
        string: Colors.green[0],
        type: Colors.grey[5]
      },
      options: {
        required: Colors.red[0],
        array: Colors.yellow[0]
      },
      hover: {
        type: Colors.yellow[0]
      }
    },
    minimap: {
      background: Colors.grey[0],
      visibleArea: Colors.grey[1],
      node: Colors.grey[5],
      borders: Colors.grey[4]
    },
    description: {
      background: Colors.grey[2],
      text: Colors.grey[5]
    },
    port: {
      background: Colors.grey[3],
      backgroundActive: Colors.grey[4],
      button: Colors.grey[0]
    },
    link: {
      main: Colors.grey[3],
      hover: Colors.yellow[0],
      active: Colors.green[0]
    },
    menu: {
      background: Colors.grey[2],
      borders: Colors.grey[3],
      text: Colors.grey[5],
      hover: Colors.grey[1]
    },
    help: {
      background: Colors.grey[2],
      text: Colors.grey[5],
      title: Colors.main[0]
    }
  }
};
