import { NodeSerialized } from "./Node";
import { LinkSerialized } from "./Link";
import { DiagramTheme } from "../Models/index";

export interface Format{
    nodes:NodeSerialized[],
    links:LinkSerialized[],
    theme?:DiagramTheme;
}