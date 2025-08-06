<script setup>
/** Renders a KML file on the map */

import { LayerType } from '@geoadmin/layers'
import log from '@geoadmin/log'
import { WarningMessage } from '@geoadmin/log/Message'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { computed, inject, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { defaultIconUrlProxyfication, parseKml } from '@/utils/kmlUtils.js'

const dispatcher = { dispatcher: 'OpenLayersKMLLayer.vue' }

const { kmlLayerConfig, parentLayerOpacity, zIndex } = defineProps({
    kmlLayerConfig: {
        validator: (value) => value.type === LayerType.KML,
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

// mapping relevant store values
const store = useStore()
const projection = computed(() => store.state.position.projection)
const availableIconSets = computed(() => store.state.drawing.iconSets)

const iconsArePresent = computed(() => availableIconSets.value.length > 0)

// extracting useful info from what we've linked so far
const layerId = computed(() => kmlLayerConfig.id)
const layerName = computed(() => kmlLayerConfig.name)
const opacity = computed(() => parentLayerOpacity ?? kmlLayerConfig.opacity)
const url = computed(() => kmlLayerConfig.baseUrl)
const kmlData = computed(() => kmlLayerConfig.kmlData)
const kmlStyle = computed(() => kmlLayerConfig.style)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, createSourceForProjection)
watch(iconsArePresent, createSourceForProjection)
watch(availableIconSets, createSourceForProjection)
watch(kmlData, createSourceForProjection)
watch(kmlStyle, createSourceForProjection)

/* We cannot directly let the vectorSource load the URL. We need to run the deserialize
function on each feature before it is added to the vectorsource, as it may overwrite
the getExtent() function and a wrong extent causes the features to sometimes disappear
from the screen.  */
const layer = new VectorLayer({
    id: layerId.value,
    uuid: kmlLayerConfig.uuid,
    opacity: opacity.value,
})

const olMap = inject('olMap')
useAddLayerToMap(layer, olMap, () => zIndex)

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
    return defaultIconUrlProxyfication(
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
                kmlLayerConfig,
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
