<script setup lang="ts">
/** Renders a KML file on the map */

import type { KMLLayer } from '@swissgeo/layers'
import type { Map } from 'ol'

import log from '@swissgeo/log'
import { WarningMessage } from '@swissgeo/log/Message'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { computed, inject, onMounted, onUnmounted, watch } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import useDrawingStore from '@/store/modules/drawing'
import usePositionStore from '@/store/modules/position'
import useUiStore from '@/store/modules/ui'
import { iconUrlProxyFy, parseKml } from '@/utils/kmlUtils'

const dispatcher: ActionDispatcher = { name: 'OpenLayersKMLLayer.vue' }

const {
    kmlLayerConfig,
    parentLayerOpacity,
    zIndex = -1,
} = defineProps<{
    kmlLayerConfig: KMLLayer
    parentLayerOpacity?: number
    zIndex?: number
}>()

// mapping relevant store values
const positionStore = usePositionStore()
const drawingStore = useDrawingStore()
const uiStore = useUiStore()
const projection = computed(() => positionStore.projection)
const resolution = computed(() => positionStore.resolution)
const availableIconSets = computed(() => drawingStore.iconSets)

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
    properties: {
        id: layerId.value,
        uuid: kmlLayerConfig.uuid,
    },
    opacity: opacity.value,
})

const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error('OpenLayersMap is not available')
    throw new Error('OpenLayersMap is not available')
}

useAddLayerToMap(layer, olMap, () => zIndex)

onMounted(() => {
    if (!iconsArePresent.value) {
        void drawingStore.loadAvailableIconSets(dispatcher)
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

function iconUrlProxy(url: string): string {
    return iconUrlProxyFy(
        url,
        (url: string) => {
            uiStore.addWarnings(
                [
                    new WarningMessage('kml_icon_url_cors_issue', {
                        layerName: layerName.value,
                        url: url,
                    }),
                ],
                dispatcher
            )
        },
        (url: string) => {
            uiStore.addWarnings(
                [
                    new WarningMessage('kml_icon_url_scheme_http', {
                        layerName: layerName.value,
                        url: url,
                    }),
                ],
                dispatcher
            )
        }
    )
}

function createSourceForProjection(): void {
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
            features: parseKml(
                kmlLayerConfig,
                projection.value,
                availableIconSets.value,
                resolution.value,
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
