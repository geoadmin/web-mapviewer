<template>
    <div>
        <CesiumWMTSLayer
            v-if="layerConfig.type === LayerTypes.WMTS && !layerConfig.isExternal"
            :wmts-layer-config="layerConfig"
            :preview-year="previewYear"
            :projection="WEBMERCATOR"
            :z-index="zIndex"
        />
        <CesiumWMSLayer
            v-if="layerConfig.type === LayerTypes.WMS && !layerConfig.isExternal"
            :wms-layer-config="layerConfig"
            :preview-year="previewYear"
            :projection="LV95"
            :z-index="zIndex"
        />
        <CesiumGeoJSONLayer
            v-if="layerConfig.type === LayerTypes.GEOJSON"
            :layer-id="layerConfig.getID()"
            :opacity="layerConfig.opacity"
            :geojson-url="layerConfig.geoJsonUrl"
            :style-url="layerConfig.styleUrl"
        />
        <CesiumKMLLayer
            v-if="layerConfig.type === LayerTypes.KML && layerConfig.addToMap"
            :layer-id="layerConfig.getID()"
            :opacity="layerConfig.opacity"
            :url="layerConfig.getURL()"
            :z-index="zIndex"
        />
        <slot />
    </div>
</template>

<script>
import AbstractLayer from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { LV95, WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import CesiumGeoJSONLayer from './CesiumGeoJSONLayer.vue'
import CesiumKMLLayer from './CesiumKMLLayer.vue'
import CesiumWMSLayer from './CesiumWMSLayer.vue'
import CesiumWMTSLayer from './CesiumWMTSLayer.vue'

/**
 * Transforms a layer config (metadata, structures can be found in api/layers/** files) into the
 * correct Cesium counterpart depending on the layer type.
 */
export default {
    components: {
        CesiumKMLLayer,
        CesiumGeoJSONLayer,
        CesiumWMTSLayer,
        CesiumWMSLayer,
    },
    props: {
        layerConfig: {
            type: AbstractLayer,
            default: null,
        },
        zIndex: {
            type: Number,
            default: -1,
        },
        previewYear: {
            type: Number,
            default: null,
        },
    },
    data() {
        return {
            LayerTypes,
            LV95,
            WEBMERCATOR,
        }
    },
}
</script>
