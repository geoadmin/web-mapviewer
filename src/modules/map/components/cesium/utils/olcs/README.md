# Partial import of ol-cesium

While migrating to Vite 5.0.11, there were many issues with TypeScript type checking (`vue-tsc`) with the ol-cesium library.

We only use a small portion of this library, the part that converts vector features, aka KML and GeoJSON, into Cesium primitives.
The easiest/quickest way of dealing with this issue was to import what we needed specifically.

## List of copied files

| ol-cesium file                                                                                                                         | web-mapviewer file                                                       | comment                                     |
|----------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|---------------------------------------------|
| [src/olcs/core.ts](https://github.com/openlayers/ol-cesium/blob/master/src/olcs/core.ts)                                               | `src/modules/map/components/cesium/utils/olcs/core.ts`                   | Removed all unused/unnecessary functions    |
| [src/olcs/util.ts](https://github.com/openlayers/ol-cesium/blob/master/src/olcs/util.ts)                                               | `src/modules/map/components/cesium/utils/olcs/util.ts`                   | Removed all unused/unnecessary functions    |
| [src/olcs/FeatureConverter.ts](https://github.com/openlayers/ol-cesium/blob/master/src/olcs/FeatureConverter.ts)                       | `src/modules/map/components/cesium/utils/olcs/FeatureConverter.ts`       | Fixed returned types and rearranged imports |
| [src/olcs/core/VectorLayerCounterpart.ts](https://github.com/openlayers/ol-cesium/blob/master/src/olcs/core/VectorLayerCounterpart.ts) | `src/modules/map/components/cesium/utils/olcs/VectorLayerCounterpart.ts` | Fixed returned types and rearranged imports |

## Future actions

Whenever ol-cesium goes above version 2.17, we could try again to add it as npm package, and see if TypeScript type checker let it through. In the meantime, we have to keep it as a shallow copy.
