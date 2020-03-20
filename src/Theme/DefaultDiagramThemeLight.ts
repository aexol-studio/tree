import { DiagramTheme } from "../Models";
import { DefaultDiagramTheme } from "./DefaultDiagramTheme";
import { Colors } from "./Colors";

export const DefaultDiagramThemeLight: DiagramTheme = {
  ...JSON.parse(JSON.stringify(DefaultDiagramTheme)),
  colors: {
    background: Colors.grey[10],
    node: {
      background: Colors.grey[2],
      selected: Colors.green[0],
      name: Colors.grey[11],
      type: Colors.grey[6],
      types: {
        string: Colors.green[0],
        type: Colors.grey[11]
      },
      options: {
        required: Colors.red[0],
        array: Colors.yellow[7]
      },
      hover: {
        type: Colors.yellow[0]
      },
      menuOpened: Colors.red[0]
    },
    minimap: {
      background: Colors.grey[0],
      visibleArea: Colors.grey[1],
      node: Colors.grey[11],
      borders: Colors.grey[4]
    },
    description: {
      background: Colors.grey[2],
      text: Colors.grey[11]
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
      text: Colors.grey[11],
      hover: Colors.grey[1]
    },
    help: {
      background: Colors.grey[2],
      text: Colors.grey[11],
      title: Colors.main[0]
    }
  }
};
