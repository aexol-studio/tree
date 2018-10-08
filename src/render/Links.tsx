import * as React from 'react';
import { LinkType, NodeType, PortType, LinkWidget } from '..';

export const renderLinks = (
  links: Array<LinkType>,
  nodes: Array<NodeType>,
  oX: (x: number) => number,
  oY: (y: number) => number,
  selectedNode?: NodeType[],
  backgroundElementPosition?: {x: number, y: number}
) => {
  const selectedNodes = function*(nodeId: string) {
    yield nodeId;
    const linked = links.filter((l: LinkType) => l.to.nodeId === nodeId).map((l) => l.from.nodeId);
    for (var l of linked) {
      yield* selectedNodes(l);
    }
  };
  let withHighlitedLinks = [];
  if (selectedNode) {
    withHighlitedLinks = selectedNode
      .map((n) => [...selectedNodes(n.id)])
      .reduce((a, b) => [...a, ...b], []);
  }
  let renderOrderedLinks = links.filter((l) => !l.noDraw);
  renderOrderedLinks.sort(
    (a, b) =>
      withHighlitedLinks.includes(a.to.nodeId) > withHighlitedLinks.includes(b.to.nodeId) ? 1 : 0
  );

  return renderOrderedLinks.map((l: LinkType) => {
    let { x: startX, y: startY, inputs: startInputs, outputs: startOutputs, required } = nodes.find(
      (n: NodeType) => n.id === l.from.nodeId
    );
    let { x: startPortX, y: startPortY } = [...startInputs, ...startOutputs].find(
      (i: PortType) => i.id === l.from.portId
    );
    let { x: endX, y: endY, inputs: endInputs, outputs: endOutputs } = nodes.find(
      (n: NodeType) => n.id === l.to.nodeId
    );
    let { x: endPortX, y: endPortY } = [...endInputs, ...endOutputs].find(
      (i: PortType) => i.id === l.to.portId
    );

    let [deltaX, deltaY] = [0, 0];

    if (backgroundElementPosition) {
      [deltaX, deltaY] = [backgroundElementPosition.x, backgroundElementPosition.y];
    }

    return (
      <LinkWidget
        key={`${l.from.portId}-${l.to.portId}`}
        required={required}
        start={{
          x: oX(deltaX + startX + startPortX),
          y: oY(deltaY + startY + startPortY)
        }}
        end={{
          x: oX(deltaX + endX + endPortX),
          y: oY(deltaY + endY + endPortY)
        }}
        selected={withHighlitedLinks.includes(l.to.nodeId)}
      />
    );
  });
};
