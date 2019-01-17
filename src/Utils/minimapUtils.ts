import { MinimapBoundaries, Size, Coords } from "../Models/index";

const MINIMAP_RANGE = 7000;

interface InternalBoundaries {
  left: number,
  top: number,
  width: number,
  height: number,
};

export class MinimapUtils {
  static getBoundingBoxViewport(
    pan: Coords,
    scale: number,
    graphSize: Size,
  ): MinimapBoundaries {
    return {
      left: -pan.x,
      right: (graphSize.width / scale) - pan.x,
      top: -pan.y,
      bottom: (graphSize.height / scale) - pan.y,
      width: graphSize.width / scale,
      height: graphSize.height / scale,
    };
  };

  static getMiniMapBoundaries(
    viewportBoundingBox: MinimapBoundaries,
    graphSize: Size,
  ): InternalBoundaries {
    return {
      left: Math.max(
        Math.min(-MINIMAP_RANGE + graphSize.width / 2, viewportBoundingBox.left),
        viewportBoundingBox.right - 2 * MINIMAP_RANGE
      ),
      top: Math.max(
        Math.min(-MINIMAP_RANGE + graphSize.height / 2, viewportBoundingBox.top),
        viewportBoundingBox.bottom - 2 * MINIMAP_RANGE
      ),
      width: 2 * MINIMAP_RANGE,
      height: 2 * MINIMAP_RANGE
    };
  };

  static mapToWorldPoint(
    point: Coords,
    miniMapBoundaries: InternalBoundaries,
    mapSize: number,
  ) {
    const delta = {
      x:
        (miniMapBoundaries.left + miniMapBoundaries.width / 2) /
        (miniMapBoundaries.width / mapSize),
      y:
        (miniMapBoundaries.top + miniMapBoundaries.height / 2) / (miniMapBoundaries.width / mapSize)
    };
    const ratio = miniMapBoundaries.width / mapSize;
    return {
      x: point.x * ratio - (mapSize / 2 - delta.x) * ratio,
      y: point.y * ratio - (mapSize / 2 - delta.y) * ratio
    };
  };

  static worldToMapWidth = (
    size: number,
    miniMapBoundaries: InternalBoundaries,
    mapSize: number,
  ) => size / (miniMapBoundaries.width / (mapSize - 1));

  static worldToMapHeight = (
    size: number,
    miniMapBoundaries: InternalBoundaries,
    mapSize: number,
  ) => size / (miniMapBoundaries.height / (mapSize - 1));

  static worldToMapPoint = (coords: Coords, mapSize: number, miniMapBoundaries: InternalBoundaries) => {
    const delta = {
      x: MinimapUtils.worldToMapWidth(miniMapBoundaries.left + miniMapBoundaries.width / 2, miniMapBoundaries, mapSize),
      y: MinimapUtils.worldToMapHeight(miniMapBoundaries.top + miniMapBoundaries.height / 2, miniMapBoundaries, mapSize)
    };
    const ratio = miniMapBoundaries.width / (mapSize - 1);
    return {
      x: mapSize / 2 - delta.x + coords.x / ratio,
      y: mapSize / 2 - delta.y + coords.y / ratio
    };
  };

}
