import { v4 as uuidv4 } from "uuid";
import { DiagramTheme } from "@models";
import { DefaultDiagramTheme } from "@theme/DefaultDiagramTheme";

// We're doing a singleton here, so config can be easily accessible across code files
let _instance: ConfigurationManager;

export interface DiagramDrawingDistanceOptions {
  nodeTitle: number;
  nodeOptions: number;
  nodeType: number;
  nodeArrows: number;
  detailedLinks: number;
  simplifiedLinks: number;
}

export interface DiagramOptions {
  autosizeWatcher: boolean;
  autosizeInterval: number;
  autosizeOnWindowResize: boolean;
  generateIdFn: () => string;
  height: number | undefined;
  theme: DiagramTheme;
  width: number | undefined;
  autoPanSmoothing: number;
  screenShotMargin: number;
  screenShotBackground: boolean;
}

const defaultOptions: DiagramOptions = {
  autosizeWatcher: true,
  autosizeInterval: 1000,
  autosizeOnWindowResize: true,
  generateIdFn: uuidv4,
  height: undefined,
  theme: DefaultDiagramTheme,
  width: undefined,
  autoPanSmoothing: 4.0,
  screenShotMargin: 300,
  screenShotBackground: false,
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
    };
  }

  static get instance(): ConfigurationManager {
    return _instance;
  }

  public getOption<T extends keyof DiagramOptions>(fieldName: T) {
    return this.options[fieldName];
  }
  public setOption<T extends keyof DiagramOptions>(
    fieldName: T,
    value: DiagramOptions[T]
  ) {
    return (this.options[fieldName] = value);
  }
}
