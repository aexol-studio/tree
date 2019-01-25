import { Node } from "../Models/Node";
import { NodeDefinition } from "../Models/NodeDefinition";

export interface NodeDefinitionSerialized
  extends Pick<NodeDefinition, "type" | "object" | "main"> {}

export interface NodeSerialized
  extends Pick<
    Node,
    "id" | "name" | "description" | "x" | "y" | "options" | "readonly"
  > {
  definition: Pick<NodeDefinition, "type" | "object" | "main">;
  editsDefinition?: Pick<NodeDefinition, "type" | "object" | "main">;
}

export const serializeNodeDefinition = ({
  type,
  object,
  main
}: NodeDefinition): NodeDefinitionSerialized => ({
  main,
  object,
  type
});

export const deserializeNodeDefinition = (
  { type, object, main }: NodeDefinitionSerialized,
  definitions: NodeDefinition[]
): NodeDefinition => {
  return definitions.find(
    d => d.type === type && d.object === object && d.main === main
  )!;
};

export const serializeNode = ({
  id,
  name,
  description,
  x,
  y,
  options,
  readonly,
  definition,
  editsDefinition
}: Node): NodeSerialized => ({
  id,
  name,
  description,
  x,
  y,
  options,
  readonly,
  definition: serializeNodeDefinition(definition),
  editsDefinition: editsDefinition
    ? serializeNodeDefinition(editsDefinition)
    : undefined
});

export const deserializeNode = (
  {
    id,
    x,
    y,
    name,
    options,
    definition,
    description,
    editsDefinition,
    readonly
  }: NodeSerialized,
  definitions: NodeDefinition[]
): Node => {
  return {
    id,
    x,
    y,
    name,
    options,
    description,
    readonly,
    definition: deserializeNodeDefinition(definition, definitions),
    editsDefinition: editsDefinition
      ? deserializeNodeDefinition(editsDefinition, definitions)
      : undefined
  };
};
