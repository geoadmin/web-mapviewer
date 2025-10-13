<script setup lang="ts">
/** Adds a GeoJSON layer to the OpenLayers map */

import type { Map } from 'ol'
import type { GeoAdminGeoJSONLayer } from '@swissgeo/layers'

import log from '@swissgeo/log'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { computed, inject, watch } from 'vue'

import OlStyleForPropertyValue from '@/modules/map/components/openlayers/utils/geoJsonStyleFromLiterals'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import usePositionStore from '@/store/modules/position.store'
import { reprojectGeoJsonGeometry } from '@/utils/geoJsonUtils'

interface Props {
    geoJsonConfig: GeoAdminGeoJSONLayer
    parentLayerOpacity?: number
    zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
    parentLayerOpacity: undefined,
    zIndex: -1,
})

// mapping relevant store values
const positionStore = usePositionStore()
const projection = computed(() => positionStore.projection)

// extracting useful info from what we've linked so far
const layerId = computed(() => props.geoJsonConfig.technicalName)
const opacity = computed(() => props.parentLayerOpacity ?? props.geoJsonConfig.opacity)
const geoJsonData = computed(() => props.geoJsonConfig.geoJsonData)
const geoJsonStyle = computed(() => props.geoJsonConfig.geoJsonStyle)
const isLoading = computed(() => props.geoJsonConfig.isLoading)

const layer = new VectorLayer({
    properties: {
        id: layerId.value,
        uuid: props.geoJsonConfig.uuid,
    },
    opacity: opacity.value,
})

function setGeoJsonStyle(): void {
    if (!geoJsonStyle.value) {
        log.debug('style was not loaded, could not create source')
        return
    }
    const styleFunction = new OlStyleForPropertyValue(geoJsonStyle.value)
    layer.setStyle((feature, res) => styleFunction.getFeatureStyle(feature, res))
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
useAddLayerToMap(layer, olMap, props.zIndex)

createSourceForProjection()

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, createSourceForProjection)
watch(isLoading, createSourceForProjection)
watch(geoJsonData, setFeatures)
</script>

<template>
    <slot />
</template>
