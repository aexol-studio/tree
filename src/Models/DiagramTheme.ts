export interface DiagramTheme {
  node: {
    width: number;
    height: number;
    nameSize: number;
    typeSize: number;
  };
  port: {
    width: number;
  };
  link: {
    strokeWidth: number;
    cornerRadius: number;
    defaultCenterPoint:number;
  };
  colors: {
    background: string;
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
    };
    link: {
      main: string;
      active: string;
    };
  };
}
