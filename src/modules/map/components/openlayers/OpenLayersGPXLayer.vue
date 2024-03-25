<script setup>
/** Renders a GPX file on the map */

import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { computed, inject, onMounted, onUnmounted, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import GPXLayer from '@/api/layers/GPXLayer.class'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { parseGpx } from '@/utils/gpxUtils'
import log from '@/utils/logging'

const props = defineProps({
    gpxLayerConfig: {
        type: GPXLayer,
        required: true,
    },
    parentLayerOpacity: {
        type: Number,
        default: null,
    },
    zIndex: {
        type: Number,
        default: -1,
    },
})
const { gpxLayerConfig, parentLayerOpacity, zIndex } = toRefs(props)

// mapping relevant store values
const store = useStore()
const projection = computed(() => store.state.position.projection)

// extracting useful info from what we've linked so far
const layerId = computed(() => gpxLayerConfig.value.id)
const opacity = computed(() => parentLayerOpacity.value || gpxLayerConfig.value.opacity)
const url = computed(() => gpxLayerConfig.value.baseUrl)
const gpxData = computed(() => gpxLayerConfig.value.gpxData)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, createSourceForProjection)
watch(gpxData, createSourceForProjection)

/* We cannot directly let the vectorSource load the URL. We need to run the deserialize
function on each feature before it is added to the vectorsource, as it may overwrite
the getExtent() function and a wrong extent causes the features to sometimes disappear
from the screen.  */
const layer = new VectorLayer({
    id: layerId.value,
    opacity: opacity.value,
})

const olMap = inject('olMap')
useAddLayerToMap(layer, olMap, zIndex)

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

function createSourceForProjection() {
    if (!gpxData.value) {
        log.debug('no GPX data loaded yet, could not create source')
        return
    }
    layer.setSource(
        new VectorSource({
            wrapX: true,
            projection: projection.value.epsg,
            features: parseGpx(gpxData.value, projection.value),
        })
    )
    log.debug('Openlayer GPX layer source created')
}
</script>

<template>
    <slot />
</template>
