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
    background: Colors.main[9],
    link: {
      main: Colors.grey[3],
    },
  },
};
