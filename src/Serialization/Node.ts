import { Node } from "../Models/Node";
import { NodeDefinition } from "../Models/NodeDefinition";

export interface NodeDefinitionSerialized
  extends Pick<NodeDefinition, "type" | "root" | "main"> {
  parent?: NodeDefinitionSerialized;
}
export interface NodeSerialized
  extends Pick<
    Node,
    "id" | "name" | "description" | "x" | "y" | "options" | "readonly"
  > {
  definition: NodeDefinitionSerialized;
  editsDefinitions?: NodeDefinitionSerialized[];
}

export const serializeNodeDefinition = ({
  type,
  root,
  main,
  parent,
}: NodeDefinition): NodeDefinitionSerialized => ({
  main,
  root,
  type,
  parent: parent && serializeNodeDefinition(parent),
});

export const deserializeNodeDefinition = (
  { type, root, main, parent }: NodeDefinitionSerialized,
  definitions: NodeDefinition[]
): NodeDefinition => {
  return definitions.find(
    (d) =>
      d.type === type &&
      d.root === root &&
      d.main === main &&
      (parent && d.parent ? d.parent.type === parent.type : true)
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
  editsDefinitions,
}: Node): NodeSerialized => ({
  id,
  name,
  description,
  x,
  y,
  options,
  readonly,
  definition: serializeNodeDefinition(definition),
  editsDefinitions:
    editsDefinitions && editsDefinitions.map(serializeNodeDefinition),
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
    editsDefinitions,
    readonly,
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
    editsDefinitions:
      editsDefinitions &&
      editsDefinitions.map((def) =>
        deserializeNodeDefinition(def, definitions)
      ),
  };
};
