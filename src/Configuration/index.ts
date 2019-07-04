import { v4 as uuidv4 } from "uuid";
import { DiagramTheme, Node } from "../Models/index";
import { DefaultDiagramTheme } from "../Theme/DefaultDiagramTheme";

// We're doing a singleton here, so config can be easily accessible across code files
let _instance: ConfigurationManager;

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
  width: undefined
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
