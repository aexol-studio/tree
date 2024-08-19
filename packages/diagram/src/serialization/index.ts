import { DiagramState } from '@/models';
import { Format } from './Format';
import { serializeLink, deserializeLink } from './Link';

export class Serializer {
  static serialize(state: Pick<DiagramState, 'nodes' | 'links'>): Format {
    return {
      nodes: state.nodes,
      links: state.links.map(serializeLink),
    };
  }
  static deserialize(state: Format): Pick<DiagramState, 'nodes' | 'links'> {
    const links = state.links.map((l) => deserializeLink(l, state.nodes));
    return {
      nodes: state.nodes,
      links,
    };
  }
}
export { Format };
