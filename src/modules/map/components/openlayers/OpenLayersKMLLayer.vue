<script setup>
/** Renders a KML file on the map */

import { getKmlFromUrl } from '@/api/files.api'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { parseKml } from '@/modules/drawing/lib/drawingUtils'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/add-layers-to-map.composable'
import log from '@/utils/logging'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { computed, inject, onUnmounted, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

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

// extracting useful info from what we've linked so far
const layerId = computed(() => kmlLayerConfig.value.getID())
const opacity = computed(() => parentLayerOpacity.value || kmlLayerConfig.value.opacity)
const url = computed(() => kmlLayerConfig.value.getURL())

const kmlData = ref(null)

function addFeatures(features) {
    if (features) {
        layer.setSource(new VectorSource({ wrapX: true, projection: projection.value.epsg }))
        layer.getSource().addFeatures(features)
    } else {
        log.error(`No KML features available to add`, features)
    }
}
async function loadKml(url) {
    try {
        kmlData.value = await getKmlFromUrl(url)

        // We cannot add the KML features without deserializing it.
        // And to deserialize we need the icon sets, which might not be yet available.
        // Therefore, we keep the raw kml features in memory when the icon sets are not yet available.
        if (availableIconSets.value?.length) {
            const features = parseKml(kmlData.value, projection.value, availableIconSets.value)
            addFeatures(features)
        }
    } catch (error) {
        log.error(`Failed to load kml from ${url}`, error)
    }
}

/* We cannot directly let the vectorSource load the URL. We need to run the deserialize
function on each feature before it is added to the vectorsource, as it may overwrite
the getExtent() function and a wrong extent causes the features to sometimes disappear
from the screen.  */
const layer = new VectorLayer({
    id: layerId.value,
    opacity: opacity.value,
})
loadKml(url.value)

const olMap = inject('olMap')
useAddLayerToMap(layer, olMap, zIndex)

// exposing things for Cypress testing
if (IS_TESTING_WITH_CYPRESS) {
    window.kmlLayer = layer
    window.kmlLayerUrl = url.value
}
onUnmounted(() => {
    if (IS_TESTING_WITH_CYPRESS) {
        delete window.kmlLayer
        delete window.kmlLayerUrl
    }
})

watch(url, (newUrl) => loadKml(newUrl))
watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, () => loadKml(url.value))
watch(availableIconSets, (newIconSets) => {
    // If we have previously loaded raw kml features, see loadKml(), then
    // add them to the vector source.
    if (kmlData.value) {
        const features = parseKml(kmlData.value, projection.value, newIconSets)
        addFeatures(features)
    }
})
</script>
