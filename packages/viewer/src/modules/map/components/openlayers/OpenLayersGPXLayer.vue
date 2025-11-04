<script setup lang="ts">
/** Renders a GPX file on the map */

import type { GPXLayer } from '@swissgeo/layers'
import type { Map } from 'ol'

import log from '@swissgeo/log'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { computed, inject, onMounted, onUnmounted, toRef, watch } from 'vue'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import usePositionStore from '@/store/modules/position'
import { parseGpx } from '@/utils/gpxUtils'

const {
    gpxLayerConfig,
    parentLayerOpacity,
    zIndex = -1,
} = defineProps<{
    gpxLayerConfig: GPXLayer
    parentLayerOpacity?: number
    zIndex?: number
}>()

// mapping relevant store values
const positionStore = usePositionStore()
const projection = computed(() => positionStore.projection)

// extracting useful info from what we've linked so far
const layerId = computed(() => gpxLayerConfig.id)
const opacity = computed(() => parentLayerOpacity ?? gpxLayerConfig.opacity)
const url = computed(() => gpxLayerConfig.baseUrl)
const gpxData = computed(() => gpxLayerConfig.gpxData)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, createSourceForProjection)
watch(gpxData, createSourceForProjection)

/* We cannot directly let the vectorSource load the URL. We need to run the deserialize
function on each feature before it is added to the vectorsource, as it may overwrite
the getExtent() function and a wrong extent causes the features to sometimes disappear
from the screen.  */
const layer = new VectorLayer({
    properties: {
        id: layerId.value,
        uuid: gpxLayerConfig.uuid,
    },
    opacity: opacity.value,
})

const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error('OpenLayersMap is not available')
    throw new Error('OpenLayersMap is not available')
}

useAddLayerToMap(layer, olMap, toRef(() => zIndex))

onMounted(() => {
    // exposing things for Cypress testing
    if (IS_TESTING_WITH_CYPRESS) {
        window.gpxLayer = layer
        window.gpxLayerUrl = url.value
    }

    createSourceForProjection()
})
onUnmounted(() => {
    if (IS_TESTING_WITH_CYPRESS) {
        delete window.gpxLayer
        delete window.gpxLayerUrl
    }
})

function createSourceForProjection(): void {
    if (!gpxData.value) {
        log.debug('no GPX data loaded yet, could not create source')
        return
    }
    layer.setSource(
        new VectorSource({
            wrapX: true,
            features: parseGpx(gpxData.value, projection.value),
        })
    )
    log.debug('Openlayer GPX layer source created')
}
</script>

<template>
    <slot />
</template>
