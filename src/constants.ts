import Graphic from "@arcgis/core/Graphic";
import { SpatialReference } from "@arcgis/core/geometry";
import Point from "@arcgis/core/geometry/Point";
import ObjectSymbol3DLayer from "@arcgis/core/symbols/ObjectSymbol3DLayer";
import PointSymbol3D from "@arcgis/core/symbols/PointSymbol3D";

export const origin = new Point({
  spatialReference: SpatialReference.WGS84,
  longitude: 8.52424,
  latitude: 47.365341,
  z: 419.37,
});

export const originGraphic = new Graphic({
  geometry: origin,
  symbol: new PointSymbol3D({
    symbolLayers: [
      new ObjectSymbol3DLayer({
        anchor: "bottom",
        height: 20,
        width: 5,
        depth: 5,
        material: {
          color: "red",
        },
        resource: {
          primitive: "inverted-cone",
        },
      }),
    ],
  }),
});

export const waterGraphic = Graphic.fromJSON({
  symbol: {
    type: "PolygonSymbol3D",
    symbolLayers: [
      { type: "Water", color: [39, 155, 145, 184], waveStrength: "calm" },
    ],
  },
  geometry: {
    hasZ: true,
    spatialReference: { latestWkid: 3857, wkid: 102100 },
    rings: [
      [
        [948919.7184999995, 6001777.573800005, 453.3862999999983],
        [948929.4009000026, 6001778.533500001, 453.3862999999983],
        [948929.817400001, 6001776.343699999, 453.3862999999983],
        [948934.3183999993, 6001775.897200003, 453.3862999999983],
        [948937.3067000024, 6001763.547499999, 453.3862999999983],
        [948934.1718000025, 6001762.848000005, 453.3862999999983],
        [948934.0700000003, 6001759.293200001, 453.3862999999983],
        [948938.1682000011, 6001757.635899998, 453.3862999999983],
        [948938.2771000005, 6001750.6630000025, 453.3862999999983],
        [948933.3296000026, 6001749.434600003, 453.3862999999983],
        [948932.8861000016, 6001753.922899999, 453.3862999999983],
        [948924.8046000004, 6001755.168000005, 453.3862999999983],
        [948919.1356000006, 6001757.9113000035, 453.3862999999983],
        [948919.4593000002, 6001763.441100001, 453.3862999999983],
        [948928.9186000004, 6001763.654100001, 453.3862999999983],
        [948928.9668000005, 6001769.301600002, 453.3862999999983],
        [948920.6289000027, 6001771.629100002, 453.3862999999983],
        [948919.7184999995, 6001777.573800005, 453.3862999999983],
      ],
    ],
  },
});
