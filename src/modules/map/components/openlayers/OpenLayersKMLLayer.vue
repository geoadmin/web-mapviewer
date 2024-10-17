<script setup>
/** Renders a KML file on the map */

import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { computed, inject, onMounted, onUnmounted, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import KMLLayer from '@/api/layers/KMLLayer.class'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { iconUrlProxyFy, parseKml } from '@/utils/kmlUtils'
import log from '@/utils/logging'
import WarningMessage from '@/utils/WarningMessage.class'

const dispatcher = { dispatcher: 'OpenLayersKMLLayer.vue' }

const props = defineProps({
    kmlLayerConfig: {
        type: KMLLayer,
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
const { kmlLayerConfig, parentLayerOpacity, zIndex } = toRefs(props)

// mapping relevant store values
const store = useStore()
const projection = computed(() => store.state.position.projection)
const availableIconSets = computed(() => store.state.drawing.iconSets)

const iconsArePresent = computed(() => availableIconSets.value.length > 0)

// extracting useful info from what we've linked so far
const layerId = computed(() => kmlLayerConfig.value.id)
const layerName = computed(() => kmlLayerConfig.value.name)
const opacity = computed(() => parentLayerOpacity.value ?? kmlLayerConfig.value.opacity)
const url = computed(() => kmlLayerConfig.value.baseUrl)
const kmlData = computed(() => kmlLayerConfig.value.kmlData)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, createSourceForProjection)
watch(iconsArePresent, createSourceForProjection)
watch(availableIconSets, createSourceForProjection)
watch(kmlData, createSourceForProjection)

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
    if (!iconsArePresent.value) {
        store.dispatch('loadAvailableIconSets', dispatcher)
    }

    // exposing things for Cypress testing
    if (IS_TESTING_WITH_CYPRESS) {
        window.kmlLayer = layer
        window.kmlLayerUrl = url.value
    }

    createSourceForProjection()
})
onUnmounted(() => {
    if (IS_TESTING_WITH_CYPRESS) {
        delete window.kmlLayer
        delete window.kmlLayerUrl
    }
})

function iconUrlProxy(url) {
    return iconUrlProxyFy(
        url,
        (url) => {
            store.dispatch('addWarnings', {
                warnings: [
                    new WarningMessage('kml_icon_url_cors_issue', {
                        layerName: layerName.value,
                        url: url,
                    }),
                ],
                ...dispatcher,
            })
        },
        (url) => {
            store.dispatch('addWarnings', {
                warnings: [
                    new WarningMessage('kml_icon_url_scheme_http', {
                        layerName: layerName.value,
                        url: url,
                    }),
                ],
                ...dispatcher,
            })
        }
    )
}

function createSourceForProjection() {
    if (!kmlData.value) {
        log.debug('no KML data loaded yet, could not create source')
        return
    }
    if (!availableIconSets.value || availableIconSets.value.length === 0) {
        log.debug('no icons loaded yet, could not create source')
        return
    }
    layer.setSource(
        new VectorSource({
            wrapX: true,
            projection: projection.value.epsg,
            features: parseKml(
                kmlLayerConfig.value,
                projection.value,
                availableIconSets.value,
                iconUrlProxy
            ),
        })
    )
    log.debug('Openlayer KML layer source created')
}
</script>

<template>
    <slot />
</template>
