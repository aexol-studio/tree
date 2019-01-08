export interface DiagramTheme {
  node: {
    width: number;
    height: number;
    nameSize: number;
    typeSize: number;
  };
  description: {
    width: number;
    height: number;
    triangleWidth: number;
    triangleHeight: number;
  };
  port: {
    width: number;
  };
  link: {
    strokeWidth: number;
    cornerRadius: number;
    defaultCenterPoint: number;
  };
  colors: {
    background: string;
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
    };
    port: {
      background: string;
      backgroundActive: string;
      button: string;
    };
    link: {
      main: string;
      active: string;
    };
  };
}
