export interface DiagramTheme {
  snappingGridSize?: number;
  autoBeuatify?: boolean;
  fontFamily: string;
  addNode: {
    fontSize: number;
  };
  node: {
    width: number;
    height: number;
    nameSize: number;
    typeSize: number;
    maxCharacters: number;
    spacing: {
      x: number;
      y: number;
    };
    options: {
      fontSize: number;
    };
  };
  graph: {
    spacing: {
      x: number;
      y: number;
    };
  };
  description: {
    width: number;
    fontSize: number;
    lineHeight: number;
    paddingHorizontal: number;
    paddingVertical: number;
    triangleWidth: number;
    triangleHeight: number;
    triangleDistance: number;
    placeholder?: string;
  };
  port: {
    gap: number;
    width: number;
  };
  link: {
    strokeWidth: number;
    cornerRadius: number;
    defaultCenterPoint: number;
  };
  menu: {
    width?: number;
    maxWidth: number;
    maxHeight: number;
    padding: string;
    borderRadius: string;
    title: {
      fontSize: string;
      fontWeight: string;
    };
    category: {
      padding: string;
      fontSize: string;
      fontWeight: string;
    };
    spacing: {
      x: number;
      y: number;
    };
  };
  help: {
    lineHeight: number;
    padding: number;
    title: {
      text: number;
    };
    text: number;
  };
  colors: {
    background: string;
    link: {
      main: string;
    };
  };
}
