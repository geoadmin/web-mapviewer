<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import LayerTypes from '@/api/layers/LayerTypes.enum'
import MaplibreGeoJSONLayer from '@/modules/map/components/maplibre/MaplibreGeoJSONLayer.vue'
import MaplibreWMSLayer from '@/modules/map/components/maplibre/MaplibreWMSLayer.vue'
import MaplibreWMTSLayer from '@/modules/map/components/maplibre/MaplibreWMTSLayer.vue'

const { layerConfig, previousLayerId } = defineProps({
    layerConfig: {
        type: Object,
        default: null,
    },
    previousLayerId: {
        type: String,
        default: null,
    },
})

const store = useStore()
// To be able to manage aggregate layers, we need to know the current map resolution
const resolution = computed(() => store.getters.resolution)

function shouldAggregateSubLayerBeVisible(subLayer) {
    // min and max resolution are set in the API file to the lowest/highest possible value if undefined, so we don't
    // have to worry about checking their validity
    return resolution.value >= subLayer.minResolution && resolution.value <= subLayer.maxResolution
}
</script>

<template>
    <MaplibreWMTSLayer
        v-if="layerConfig.type === LayerTypes.WMTS"
        :wmts-layer-config="layerConfig"
        :previous-layer-id="previousLayerId"
    />
    <MaplibreWMSLayer
        v-if="layerConfig.type === LayerTypes.WMS"
        :wms-layer-config="layerConfig"
        :previous-layer-id="previousLayerId"
    />
    <MaplibreGeoJSONLayer
        v-if="layerConfig.type === LayerTypes.GEOJSON"
        :layer-id="layerConfig.id"
        :data-url="layerConfig.geoJsonUrl"
        :style-url="layerConfig.styleUrl"
    /><!--
    Aggregate layers are some kind of a edge case where two or more layers are joint together but only one of them
    is visible depending on the map resolution.
    We have to manage aggregate layers straight here otherwise we won't be able to make a recursive call to this
    component in another child (that would be OpenLayersAggregateLayer.vue component, that doesn't work).
    See https://vuejs.org/v2/guide/components-edge-cases.html#Recursive-Components for more info
    -->
    <template v-if="layerConfig.type === LayerTypes.AGGREGATE">
        <!-- we can't v-for and v-if at the same time, so we need to wrap all sub-layers in a <div> -->
        <template
            v-for="aggregateSubLayer in layerConfig.subLayers"
            :key="aggregateSubLayer.subLayerId"
        >
            <maplibre-internal-layer
                v-if="shouldAggregateSubLayerBeVisible(aggregateSubLayer)"
                :layer-config="aggregateSubLayer.layer"
                :previous-layer-id="previousLayerId"
            />
        </template>
    </template>
    <!--        <OpenLayersKMLLayer-->
    <!--          v-if="layerConfig.type === LayerTypes.KML"-->
    <!--          :layer-id="layerConfig.id"-->
    <!--          :opacity="layerConfig.opacity"-->
    <!--          :url="layerConfig.getURL()"-->
    <!--          :z-index="zIndex"-->
    <!--        />-->
    <slot />
</template>
