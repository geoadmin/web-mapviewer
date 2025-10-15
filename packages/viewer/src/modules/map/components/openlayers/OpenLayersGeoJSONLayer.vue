<script setup lang="ts">
/** Adds a GeoJSON layer to the OpenLayers map */

import type { Map } from 'ol'
import type { FeatureLike } from 'ol/Feature'
import type { GeoAdminGeoJSONLayer } from '@swissgeo/layers'

import log from '@swissgeo/log'
import { Feature } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { computed, inject, watch } from 'vue'

import OlStyleForPropertyValue from '@/modules/map/components/openlayers/utils/geoJsonStyleFromLiterals'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import usePositionStore from '@/store/modules/position.store'
import { reprojectGeoJsonGeometry } from '@/utils/geoJsonUtils'

const {
    geoJsonConfig,
    parentLayerOpacity,
    zIndex = -1,
} = defineProps<{
    geoJsonConfig: GeoAdminGeoJSONLayer
    parentLayerOpacity?: number
    zIndex?: number
}>()

// mapping relevant store values
const positionStore = usePositionStore()
const projection = computed(() => positionStore.projection)

// extracting useful info from what we've linked so far
const layerId = computed(() => geoJsonConfig.technicalName)
const opacity = computed(() => parentLayerOpacity ?? geoJsonConfig.opacity)
const geoJsonData = computed(() => geoJsonConfig.geoJsonData)
const geoJsonStyle = computed(() => geoJsonConfig.geoJsonStyle)
const isLoading = computed(() => geoJsonConfig.isLoading)

const layer = new VectorLayer({
    properties: {
        id: layerId.value,
        uuid: geoJsonConfig.uuid,
    },
    opacity: opacity.value,
})

function setGeoJsonStyle(): void {
    if (!geoJsonStyle.value) {
        log.debug('style was not loaded, could not create source')
        return
    }
    const styleFunction = new OlStyleForPropertyValue(geoJsonStyle.value)
    layer.setStyle((feature: FeatureLike, res) => {
        // OpenLayers passes FeatureLike, but our style function expects Feature
        // RenderFeature doesn't have the same methods as Feature, so we need to handle this
        if (feature instanceof Feature) {
            return styleFunction.getFeatureStyle(feature, res)
        }
        // For RenderFeature, return a default style or handle differently
        return styleFunction.defaultStyle
    })
}
function setFeatures(): void {
    if (!geoJsonData.value) {
        log.debug('no GeoJSON data loaded yet, could not create source')
        return
    }
    const geoJsonObject =
        typeof geoJsonData.value === 'string' ? JSON.parse(geoJsonData.value) : geoJsonData.value
    layer.setSource(
        new VectorSource({
            features: new GeoJSON().readFeatures(
                reprojectGeoJsonGeometry(geoJsonObject, projection.value)
            ),
        })
    )
}

function createSourceForProjection(): void {
    setGeoJsonStyle()
    setFeatures()
}

const olMap = inject<Map>('olMap')!
useAddLayerToMap(layer, olMap, zIndex)

createSourceForProjection()

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, createSourceForProjection)
watch(isLoading, createSourceForProjection)
watch(geoJsonData, setFeatures)
</script>

<template>
    <slot />
</template>
