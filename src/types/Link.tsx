export type LinkType = {
  from: {
    nodeId: string;
    portId: string;
  };
  to: {
    nodeId: string;
    portId: string;
  };
  noDraw?: boolean;
};
export type LinkWidgetProps = {
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
  selected?: boolean;
  required?: boolean;
};
