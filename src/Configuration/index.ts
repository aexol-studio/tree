import { v4 as uuidv4 } from "uuid";
import { DiagramTheme, Node } from "../Models/index";
import { DefaultDiagramTheme } from "../Theme/DefaultDiagramTheme";

// We're doing a singleton here, so config can be easily accessible across code files
let _instance: ConfigurationManager;

export interface DiagramDrawingDistanceOptions {
  nodeTitle: number;
  nodeOptions: number;
  nodeType: number;
  nodeArrows: number;
  detailedLinks: number,
  simplifiedLinks: number,
};

export interface DiagramOptions {
  autosizeWatcher: boolean;
  autosizeInterval: number;
  autosizeOnWindowResize: boolean;
  connectionFunction: (input: Node, output: Node) => boolean;
  disableLinkOperations: boolean;
  generateIdFn: () => string;
  height: number | undefined;
  theme: DiagramTheme;
  width: number | undefined;
  drawingDistance: Partial<DiagramDrawingDistanceOptions>
}

const defaultOptions: DiagramOptions = {
  autosizeWatcher: true,
  autosizeInterval: 1000,
  autosizeOnWindowResize: true,
  disableLinkOperations: false,
  connectionFunction: (input, output) => true,
  generateIdFn: uuidv4,
  height: undefined,
  theme: DefaultDiagramTheme,
  width: undefined,
  drawingDistance: {
    nodeTitle: 0.0,
    nodeOptions: 0.0,
    nodeType: 0.0,
    nodeArrows: 0.0,
    detailedLinks: 0.7,
    simplifiedLinks: 0.0,
  },
};

export class ConfigurationManager {
  private options: DiagramOptions = defaultOptions;

  constructor(providedOptions: Partial<DiagramOptions>) {
    _instance = this;

    if (providedOptions.width && providedOptions.height) {
      this.options.autosizeWatcher = false;
      this.options.autosizeOnWindowResize = false;
    }

    this.options = {
      ...this.options,
      ...providedOptions,
      drawingDistance: {
        ...this.options.drawingDistance,
        ...providedOptions.drawingDistance,
      }
    };
  }

  static get instance(): ConfigurationManager {
    return _instance;
  }

  public getOption<T extends keyof DiagramOptions>(fieldName: T) {
    return this.options[fieldName];
  }

  public getDistance<T extends keyof DiagramDrawingDistanceOptions>(distanceName: T): number {
    if (!this.options.drawingDistance[distanceName]) {
      return 0.0;
    }
    return this.options.drawingDistance[distanceName]!;
  }
}
