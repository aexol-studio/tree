import * as React from 'react';
import { MiniMapType } from '../types/MiniMap';
import * as styles from './style/MiniMap';
import { MiniMapNodes } from '../canvas-renderer/MiniMapNodes';

const MINIMAP_RANGE = 3000;

export class MiniMap extends React.PureComponent<MiniMapType> {
  minimapRef: HTMLDivElement = null;
  mousePanning: boolean = false;
  canvas = new MiniMapNodes(200, 200);
  private getBoundingBoxViewport = (currentPan: { x: number; y: number }) => ({
    left: -currentPan.x / this.props.scale,
    right: (this.props.graphWidth - currentPan.x) / this.props.scale,
    top: -currentPan.y / this.props.scale,
    bottom: (this.props.graphHeight - currentPan.y) / this.props.scale,
    width: this.props.graphWidth / this.props.scale,
    height: this.props.graphHeight / this.props.scale
  });

  private getMiniMapBoundaries = (viewportBoundingBox) => ({
    left: Math.max(
      Math.min(-MINIMAP_RANGE + this.props.graphWidth / 2, viewportBoundingBox.left),
      viewportBoundingBox.right - 2 * MINIMAP_RANGE
    ),
    top: Math.max(
      Math.min(-MINIMAP_RANGE + this.props.graphHeight / 2, viewportBoundingBox.top),
      viewportBoundingBox.bottom - 2 * MINIMAP_RANGE
    ),
    width: 2 * MINIMAP_RANGE,
    height: 2 * MINIMAP_RANGE
  });

  private mouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const mouseCoords = {
      x: e.clientX,
      y: e.clientY
    };

    if (this.props.onPanStart) {
      this.props.onPanStart();
    }

    this.panEvent(mouseCoords.x, mouseCoords.y);
    this.mousePanning = true;
  };

  private mouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    this.mousePanning = false;

    if (this.props.onPanFinish) {
      this.props.onPanFinish();
    }
  };

  private mouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (this.mousePanning) {
      const mouseCoords = {
        x: e.clientX,
        y: e.clientY
      };

      this.panEvent(mouseCoords.x, mouseCoords.y);
    }
  };

  private panEvent = (mouseX: number, mouseY: number) => {
    const { width, height, graphWidth, graphHeight, scale, pan, onPanEvent } = this.props;

    // calculate placement of the minimap
    const elementBoundingBox = this.minimapRef.getBoundingClientRect();

    // get bounding box of actual viewport in world coordinates
    const boundingBoxViewport = this.getBoundingBoxViewport(pan);

    // get actual boundaries (left, right, width and height) of the map in world coordinates
    const miniMapBoundaries = this.getMiniMapBoundaries(boundingBoxViewport);

    // function converts map coordinates to world coordinates
    const mapToWorldPoint = (px, py) => {
      const delta = {
        x:
          (miniMapBoundaries.left + miniMapBoundaries.width / 2) /
          (miniMapBoundaries.width / width),
        y:
          (miniMapBoundaries.top + miniMapBoundaries.height / 2) / (miniMapBoundaries.width / width)
      };
      const ratio = miniMapBoundaries.width / width;
      return {
        x: px * ratio - (width / 2 - delta.x) * ratio,
        y: py * ratio - (height / 2 - delta.y) * ratio
      };
    };

    // calculate world coordinates point from the mouse clock X/Y
    const worldCoords = mapToWorldPoint(
      mouseX - elementBoundingBox.left,
      mouseY - elementBoundingBox.top
    );

    // calculate potential pan value after the change
    const newPanValue = {
      x: -worldCoords.x * scale + graphWidth / 2,
      y: -worldCoords.y * scale + graphHeight / 2
    };

    // calculate potential new viewport after panning
    const newViewport = this.getBoundingBoxViewport(newPanValue);

    // if we're out of the boundaries during panning, clamp those values for x...
    if (
      newViewport.left < miniMapBoundaries.left ||
      newViewport.right > miniMapBoundaries.left + miniMapBoundaries.width
    ) {
      newPanValue.x = pan.x;
    }

    // ...and y
    if (
      newViewport.top < miniMapBoundaries.top ||
      newViewport.bottom > miniMapBoundaries.top + miniMapBoundaries.height
    ) {
      newPanValue.y = pan.y;
    }

    // return new pan values
    if (onPanEvent) {
      onPanEvent(newPanValue.x, newPanValue.y);
    }
  };
  render() {
    const { nodes, width, height, pan } = this.props;

    // get bounding box of actual viewport in world coordinates
    const boundingBoxViewport = this.getBoundingBoxViewport(pan);

    // get actual boundaries (left, right, width and height) of the map in world coordinates
    const miniMapBoundaries = this.getMiniMapBoundaries(boundingBoxViewport);

    // function converts lengths from world coordinate system to map coordinate system
    const worldToMapWidth = (size) => size / (miniMapBoundaries.width / (width - 1));
    const worldToMapHeight = (size) => size / (miniMapBoundaries.height / (height - 1));

    // function converts points from world coordinate system to map coordinate system
    const worldToMapPoint = (px, py) => {
      const delta = {
        x: worldToMapWidth(miniMapBoundaries.left + miniMapBoundaries.width / 2),
        y: worldToMapHeight(miniMapBoundaries.top + miniMapBoundaries.height / 2)
      };
      const ratio = miniMapBoundaries.width / (width - 1);
      return {
        x: width / 2 - delta.x + px / ratio,
        y: height / 2 - delta.y + py / ratio
      };
    };

    // calculate X, Y of the viewport in the map coordinate system
    const viewportCoord = worldToMapPoint(boundingBoxViewport.left, boundingBoxViewport.top);

    const areaCoordinates = {
      width: worldToMapWidth(boundingBoxViewport.width),
      height: worldToMapHeight(boundingBoxViewport.height),
      left: viewportCoord.x - 1,
      top: viewportCoord.y - 1
    };

    return (
      <div
        className={styles.MiniMap}
        onMouseDown={this.mouseDown}
        onMouseMove={this.mouseMove}
        onMouseUp={this.mouseUp}
        onMouseLeave={this.mouseUp}
        ref={(ref) => {
          if (ref) {
            this.minimapRef = ref;
            this.canvas.registerContainerElement(ref)
          }
        }}
        style={{
          width,
          height
        }}
      >
        {this.canvas.render({ nodes: nodes.map((n) => worldToMapPoint(n.x, n.y)) })}
        <div className={styles.MiniMapWhere} style={areaCoordinates} />
      </div>
    );
  }
}
