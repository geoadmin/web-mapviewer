<script setup>
/**
 * Transforms a layer config (metadata, structures can be found in api/layers/** files) into the
 * correct Cesium counterpart depending on the layer type.
 */

import { CoordinateSystem } from '@geoadmin/coordinates'
import { LayerType, validateLayerProp } from '@geoadmin/layers'
import { computed } from 'vue'
import { useStore } from 'vuex'

import CesiumGeoJSONLayer from '@/modules/map/components/cesium/CesiumGeoJSONLayer.vue'
import CesiumGPXLayer from '@/modules/map/components/cesium/CesiumGPXLayer.vue'
import CesiumKMLLayer from '@/modules/map/components/cesium/CesiumKMLLayer.vue'
import CesiumVectorLayer from '@/modules/map/components/cesium/CesiumVectorLayer.vue'
import CesiumWMSLayer from '@/modules/map/components/cesium/CesiumWMSLayer.vue'
import CesiumWMTSLayer from '@/modules/map/components/cesium/CesiumWMTSLayer.vue'

const { layerConfig, zIndex, projection, isTimeSliderActive, parentLayerOpacity } = defineProps({
    layerConfig: {
        validator: validateLayerProp,
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
})

const store = useStore()

const resolution = computed(() => store.getters.resolution)

function shouldAggregateSubLayerBeVisible(subLayer) {
    // min and max resolution are set in the API file to the lowest/highest possible value if undefined, so we don't
    // have to worry about checking their validity
    return resolution.value >= subLayer.minResolution && resolution.value <= subLayer.maxResolution
}
</script>

<template>
    <CesiumVectorLayer
        v-if="layerConfig.type === LayerType.VECTOR"
        :layer-config="layerConfig"
    />
    <CesiumWMTSLayer
        v-if="layerConfig.type === LayerType.WMTS"
        :wmts-layer-config="layerConfig"
        :parent-layer-opacity="parentLayerOpacity"
        :z-index="zIndex"
    />
    <CesiumWMSLayer
        v-if="layerConfig.type === LayerType.WMS"
        :wms-layer-config="layerConfig"
        :parent-layer-opacity="parentLayerOpacity"
        :z-index="zIndex"
    />
    <div v-if="layerConfig.type === LayerType.GROUP">
        <CesiumWMSLayer
            v-for="(layer, index) in layerConfig.layers"
            :key="`${layer.id}-${index}`"
            :wms-layer-config="layer"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex + index"
        />
    </div>
    <div v-if="layerConfig.type === LayerType.AGGREGATE">
        <!-- we can't v-for and v-if at the same time, so we need to wrap all sub-layers in a <div> -->
        <div
            v-for="aggregateSubLayer in layerConfig.subLayers"
            :key="aggregateSubLayer.subLayerId"
        >
            <cesium-internal-layer
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
        v-if="layerConfig.type === LayerType.GEOJSON && !layerConfig.isLoading"
        :geo-json-config="layerConfig"
    />
    <CesiumKMLLayer
        v-if="layerConfig.type === LayerType.KML && !layerConfig.isLoading"
        :kml-layer-config="layerConfig"
    />
    <CesiumGPXLayer
        v-if="layerConfig.type === LayerType.GPX && !layerConfig.isLoading"
        :gpx-layer-config="layerConfig"
    />
    <slot />
</template>
