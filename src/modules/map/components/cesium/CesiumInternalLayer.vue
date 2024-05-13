<template>
    <div>
        <CesiumVectorLayer
            v-if="layerConfig.type === LayerTypes.VECTOR"
            :layer-config="layerConfig"
        />
        <CesiumWMTSLayer
            v-if="layerConfig.type === LayerTypes.WMTS"
            :wmts-layer-config="layerConfig"
            :preview-year="previewYear"
            :projection="projection"
            :z-index="zIndex"
            :is-time-slider-active="isTimeSliderActive"
        />
        <CesiumWMSLayer
            v-if="layerConfig.type === LayerTypes.WMS"
            :wms-layer-config="layerConfig"
            :preview-year="previewYear"
            :projection="projection"
            :z-index="zIndex"
            :is-time-slider-active="isTimeSliderActive"
        />
        <div v-if="layerConfig.type === LayerTypes.GROUP">
            <CesiumWMSLayer
                v-for="(layer, index) in layerConfig.layers"
                :key="`${layer.id}-${index}`"
                :wms-layer-config="layer"
                :preview-year="previewYear"
                :projection="projection"
                :z-index="zIndex + index"
                :is-time-slider-active="isTimeSliderActive"
            />
        </div>
        <CesiumGeoJSONLayer
            v-if="layerConfig.type === LayerTypes.GEOJSON"
            :layer-id="layerConfig.id"
            :opacity="layerConfig.opacity"
            :geojson-url="layerConfig.geoJsonUrl"
            :style-url="layerConfig.styleUrl"
            :projection="projection"
        />
        <CesiumKMLLayer
            v-if="layerConfig.type === LayerTypes.KML"
            :kml-layer-config="layerConfig"
        />
        <slot />
    </div>
</template>

<script>
import AbstractLayer from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import CesiumVectorLayer from '@/modules/map/components/cesium/CesiumVectorLayer.vue'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'

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
        CesiumVectorLayer,
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
        projection: {
            type: CoordinateSystem,
            required: true,
        },
        isTimeSliderActive: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            LayerTypes,
        }
    },
}
</script>
