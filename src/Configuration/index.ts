import { v4 as uuidv4 } from "uuid";
import { DiagramTheme, Node } from "../Models/index";
import { DefaultDiagramTheme } from "../Theme/DefaultDiagramTheme";

// We're doing a singleton here, so config can be easily accessible across code files
let _instance: ConfigurationManager;

export interface DiagramOptions {
  width: number | undefined;
  height: number | undefined;
  generateIdFn: () => string;
  theme: DiagramTheme;
  connectionFunction: (input: Node, output: Node) => boolean;
  autosizeWatcher: boolean;
  autosizeInterval: number;
  autosizeOnWindowResize: boolean;
}

const defaultOptions: DiagramOptions = {
  width: undefined,
  height: undefined,
  generateIdFn: uuidv4,
  theme: DefaultDiagramTheme,
  connectionFunction: (input, output) => true,
  autosizeWatcher: true,
  autosizeInterval: 1000,
  autosizeOnWindowResize: true
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
      ...providedOptions
    };
  }

  static get instance(): ConfigurationManager {
    return _instance;
  }

  public getOption<T extends keyof DiagramOptions>(fieldName: T) {
    return this.options[fieldName];
  }
}
