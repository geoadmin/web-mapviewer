<template>
    <CesiumVectorLayer v-if="layerConfig.type === LayerTypes.VECTOR" :layer-config="layerConfig" />
    <CesiumWMTSLayer
        v-if="layerConfig.type === LayerTypes.WMTS"
        :wmts-layer-config="layerConfig"
        :projection="projection"
        :parent-layer-opacity="parentLayerOpacity"
        :z-index="zIndex"
        :is-time-slider-active="isTimeSliderActive"
    />
    <CesiumWMSLayer
        v-if="layerConfig.type === LayerTypes.WMS"
        :wms-layer-config="layerConfig"
        :projection="projection"
        :z-index="zIndex"
    />
    <div v-if="layerConfig.type === LayerTypes.GROUP">
        <CesiumWMSLayer
            v-for="(layer, index) in layerConfig.layers"
            :key="`${layer.id}-${index}`"
            :wms-layer-config="layer"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex + index"
        />
    </div>
    <div v-if="layerConfig.type === LayerTypes.AGGREGATE">
        <!-- we can't v-for and v-if at the same time, so we need to wrap all sub-layers in a <div> -->
        <div v-for="aggregateSubLayer in layerConfig.subLayers" :key="aggregateSubLayer.subLayerId">
            <CesiumInternalLayer
                v-if="shouldAggregateSubLayerBeVisible(aggregateSubLayer)"
                :layer-config="aggregateSubLayer.layer"
                :parent-layer-opacity="layerConfig.opacity"
                :projection="projection"
                :is-time-slider-active="isTimeSliderActive"
                :z-index="zIndex"
            />
        </div>
    </div>
    <CesiumGeoJSONLayer
        v-if="layerConfig.type === LayerTypes.GEOJSON"
        :geo-json-config="layerConfig"
    />
    <CesiumKMLLayer v-if="layerConfig.type === LayerTypes.KML" :kml-layer-config="layerConfig" />
    <CesiumGPXLayer v-if="layerConfig.type === LayerTypes.GPX" :gpx-layer-config="layerConfig" />
    <slot />
</template>

<script>
import { mapGetters } from 'vuex'

import AbstractLayer from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import CesiumGeoJSONLayer from '@/modules/map/components/cesium/CesiumGeoJSONLayer.vue'
import CesiumVectorLayer from '@/modules/map/components/cesium/CesiumVectorLayer.vue'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'

import CesiumGPXLayer from './CesiumGPXLayer.vue'
import CesiumKMLLayer from './CesiumKMLLayer.vue'
import CesiumWMSLayer from './CesiumWMSLayer.vue'
import CesiumWMTSLayer from './CesiumWMTSLayer.vue'

/**
 * Transforms a layer config (metadata, structures can be found in api/layers/** files) into the
 * correct Cesium counterpart depending on the layer type.
 */
export default {
    name: 'CesiumInternalLayer',
    components: {
        CesiumVectorLayer,
        CesiumGPXLayer,
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
        projection: {
            type: CoordinateSystem,
            required: true,
        },
        isTimeSliderActive: {
            type: Boolean,
            default: false,
        },
        parentLayerOpacity: {
            type: Number,
            default: null,
        },
    },
    data() {
        return {
            LayerTypes,
        }
    },
    computed: {
        ...mapGetters(['resolution']),
    },
    methods: {
        shouldAggregateSubLayerBeVisible(subLayer) {
            // min and max resolution are set in the API file to the lowest/highest possible value if undefined, so we don't
            // have to worry about checking their validity
            return (
                this.resolution >= subLayer.minResolution &&
                this.resolution <= subLayer.maxResolution
            )
        },
    },
}
</script>
