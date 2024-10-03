<script setup>
/**
 * Transforms a layer config (metadata, structures can be found in api/layers/** files) into the
 * correct Cesium counterpart depending on the layer type.
 */

import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'

import AbstractLayer from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import CesiumGeoJSONLayer from '@/modules/map/components/cesium/CesiumGeoJSONLayer.vue'
import CesiumGPXLayer from '@/modules/map/components/cesium/CesiumGPXLayer.vue'
import CesiumKMLLayer from '@/modules/map/components/cesium/CesiumKMLLayer.vue'
import CesiumVectorLayer from '@/modules/map/components/cesium/CesiumVectorLayer.vue'
import CesiumWMSLayer from '@/modules/map/components/cesium/CesiumWMSLayer.vue'
import CesiumWMTSLayer from '@/modules/map/components/cesium/CesiumWMTSLayer.vue'

const props = defineProps({
    layerConfig: {
        type: AbstractLayer,
        default: null,
    },
    zIndex: {
        type: Number,
        default: -1,
    },
    parentLayerOpacity: {
        type: Number,
        default: null,
    },
})
const { layerConfig, zIndex, parentLayerOpacity } = toRefs(props)

const store = useStore()
const resolution = computed(() => store.getters.resolution)

function shouldAggregateSubLayerBeVisible(subLayer) {
    // min and max resolution are set in the API file to the lowest/highest possible value if undefined, so we don't
    // have to worry about checking their validity
    return resolution.value >= subLayer.minResolution && resolution.value <= subLayer.maxResolution
}
</script>

<template>
    <CesiumVectorLayer v-if="layerConfig.type === LayerTypes.VECTOR" :layer-config="layerConfig" />
    <CesiumWMTSLayer
        v-if="layerConfig.type === LayerTypes.WMTS"
        :wmts-layer-config="layerConfig"
        :parent-layer-opacity="parentLayerOpacity"
        :z-index="zIndex"
    />
    <CesiumWMSLayer
        v-if="layerConfig.type === LayerTypes.WMS"
        :wms-layer-config="layerConfig"
        :parent-layer-opacity="parentLayerOpacity"
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
            <cesium-internal-layer
                v-if="shouldAggregateSubLayerBeVisible(aggregateSubLayer)"
                :layer-config="aggregateSubLayer.layer"
                :parent-layer-opacity="layerConfig.opacity"
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
