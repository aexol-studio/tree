export interface DiagramTheme {
  snappingGridSize?: number;
  autoBeuatify?: boolean;
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
  minimap: {
    alpha: number;
    hoverAlpha: number;
    size: number;
    margin: number;
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
    maxWidth: number;
    maxHeight: number;
    padding: string;
    borderRadius: string;
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
    title: {
      text: number;
    };
    text: number;
  };
  colors: {
    background: string;
    minimap: {
      background: string;
      visibleArea: string;
      borders: string;
      node: string;
    };
    menu: {
      background: string;
      hover: string;
      text: string;
    };
    help: {
      background: string;
      title: string;
      text: string;
    };
    description: {
      background: string;
      text: string;
    };
    node: {
      background: string;
      selected: string;
      name: string;
      type: string;
      types: Record<string, string>;
      options: Record<string, string>;
      hover: {
        type: string;
      };
    };
    port: {
      background: string;
      backgroundActive: string;
      button: string;
    };
    link: {
      main: string;
      active: string;
      hover: string;
    };
  };
}
