<script setup lang="ts">
/** Transforms a layer config into the correct Cesium counterpart depending on the layer type. */

import type { CoordinateSystem } from '@swissgeo/coordinates'

import {
    type ExternalWMSLayer,
    type ExternalWMTSLayer,
    type GeoAdmin3DLayer,
    type GeoAdminAggregateLayer,
    type GeoAdminGeoJSONLayer,
    type GeoAdminGroupOfLayers,
    type GeoAdminWMSLayer,
    type GeoAdminWMTSLayer,
    type GPXLayer,
    type KMLLayer,
    type Layer,
    LayerType,
} from '@swissgeo/layers'
import { computed } from 'vue'

import CesiumGeoJSONLayer from '@/modules/map/components/cesium/CesiumGeoJSONLayer.vue'
import CesiumGPXLayer from '@/modules/map/components/cesium/CesiumGPXLayer.vue'
import CesiumKMLLayer from '@/modules/map/components/cesium/CesiumKMLLayer.vue'
import CesiumVectorLayer from '@/modules/map/components/cesium/CesiumVectorLayer.vue'
import CesiumWMSLayer from '@/modules/map/components/cesium/CesiumWMSLayer.vue'
import CesiumWMTSLayer from '@/modules/map/components/cesium/CesiumWMTSLayer.vue'
import usePositionStore from '@/store/modules/position'

const { layerConfig, zIndex, projection, isTimeSliderActive, parentLayerOpacity } = defineProps<{
    layerConfig: Layer
    zIndex?: number
    projection: CoordinateSystem
    isTimeSliderActive?: boolean
    parentLayerOpacity?: number
}>()

const positionStore = usePositionStore()
const resolution = computed(() => positionStore.resolution)

const isWMTS = computed(() => layerConfig.type === LayerType.WMTS)
const wmtsLayerConfig = computed(() => layerConfig as GeoAdminWMTSLayer | ExternalWMTSLayer)
const isWMS = computed(() => layerConfig.type === LayerType.WMS)
const wmsLayerConfig = computed(() => layerConfig as GeoAdminWMSLayer | ExternalWMSLayer)
const isGroup = computed(() => layerConfig.type === LayerType.GROUP)
const groupConfig = computed(() => layerConfig as GeoAdminGroupOfLayers)
const isAggregate = computed(() => layerConfig.type === LayerType.AGGREGATE)
const aggregateConfig = computed(() => layerConfig as GeoAdminAggregateLayer)

function shouldAggregateSubLayerBeVisible(subLayer: {
    minResolution: number
    maxResolution: number
}) {
    // min and max resolution are set in the API file to the lowest/highest possible value if undefined, so we don't
    // have to worry about checking their validity
    return resolution.value >= subLayer.minResolution && resolution.value <= subLayer.maxResolution
}
</script>

<template>
    <CesiumVectorLayer
        v-if="layerConfig.type === LayerType.VECTOR"
        :layer-config="layerConfig as GeoAdmin3DLayer"
    />
    <CesiumWMTSLayer
        v-if="isWMTS"
        :wmts-layer-config="wmtsLayerConfig"
        :parent-layer-opacity="parentLayerOpacity ?? undefined"
        :z-index="zIndex"
    />
    <CesiumWMSLayer
        v-if="isWMS"
        :wms-layer-config="wmsLayerConfig"
        :parent-layer-opacity="parentLayerOpacity ?? undefined"
        :z-index="zIndex"
    />
    <div v-if="isGroup">
        <CesiumWMSLayer
            v-for="(layer, index) in groupConfig.layers as (GeoAdminWMSLayer | ExternalWMSLayer)[]"
            :key="`${layer.id}-${index}`"
            :wms-layer-config="layer"
            :parent-layer-opacity="parentLayerOpacity ?? undefined"
            :z-index="(zIndex ?? 0) + index"
        />
    </div>
    <div v-if="isAggregate">
        <!-- we can't v-for and v-if at the same time, so we need to wrap all sub-layers in a <div> -->
        <div
            v-for="aggregateSubLayer in aggregateConfig.subLayers"
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
        :geo-json-config="layerConfig as GeoAdminGeoJSONLayer"
    />
    <CesiumKMLLayer
        v-if="layerConfig.type === LayerType.KML && !layerConfig.isLoading"
        :kml-layer-config="layerConfig as KMLLayer"
    />
    <CesiumGPXLayer
        v-if="layerConfig.type === LayerType.GPX && !layerConfig.isLoading"
        :gpx-layer-config="layerConfig as GPXLayer"
    />
    <slot />
</template>
