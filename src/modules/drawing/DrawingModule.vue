<script setup>
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import DrawingInteractions from '@/modules/drawing/components/DrawingInteractions.vue'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox.vue'
import DrawingTooltip from '@/modules/drawing/components/DrawingTooltip.vue'
import { DrawingState } from '@/modules/drawing/lib/export-utils'
import useKmlDataManagement from '@/modules/drawing/useKmlDataManagement.composable'
import { getIcon, parseIconUrl } from '@/utils/kmlUtils'
import log from '@/utils/logging'

const olMap = inject('olMap')

const drawingInteractions = ref(null)
const isNewDrawing = ref(true)

const store = useStore()
const availableIconSets = computed(() => store.state.drawing.iconSets)
const projection = computed(() => store.state.position.projection)
const activeKmlLayer = computed(() => store.getters.activeKmlLayer)
const featureIds = computed(() => store.state.drawing.featureIds)
const isDrawingEmpty = computed(() => store.getters.isDrawingEmpty)

const drawingLayer = new VectorLayer({
    source: createSourceForProjection(),
    zIndex: 9999,
})
provide('drawingLayer', drawingLayer)

const { addKmlLayerToDrawing, saveDrawing, saveState, savesInProgress } =
    useKmlDataManagement(drawingLayer)
const isDrawingModified = computed(() => {
    return ![DrawingState.INITIAL, DrawingState.LOADED, DrawingState.LOAD_ERROR].includes(
        saveState.value
    )
})

watch(projection, () => {
    drawingLayer.setSource(createSourceForProjection())
})
// watching feature IDs so that we can react whenever one is removed through the "trash button"
watch(featureIds, (next, last) => {
    const removed = last.filter((id) => !next.includes(id))
    if (removed.length > 0) {
        log.debug(`${removed.length} feature(s) have been removed, removing them from source`)
        const source = drawingLayer.getSource()
        source
            .getFeatures()
            .filter((feature) => removed.includes(feature.getId()))
            .forEach((feature) => source.removeFeature(feature))
        saveDrawing()
    }
})
watch(availableIconSets, () => {
    // Here this is a workaround for the legacy drawing opened in admin mode. In this case if
    // the availableIconSets is not yet loaded while parsing the KML, we cannot build the correct
    // DrawingIcon for default set icon because the icon name in the legacy icon service (mf-chsdi3)
    // did not have any numbered prefix. This means that without this workaround the icon preselection
    // from the set will not work and when modifying the drawing you might end up with a brocken
    // drawing.
    log.debug(
        'New iconsets available update all drawing features',
        drawingLayer.getSource().getFeatures()
    )
    featureIds.value.forEach((featureId) => {
        const feature = drawingLayer.getSource()?.getFeatureById(featureId)?.get('editableFeature')
        if (feature?.icon) {
            const iconArgs = parseIconUrl(feature.icon.imageURL)
            const icon = getIcon(iconArgs, null /*iconStyle*/, availableIconSets.value)
            if (icon) {
                feature.icon = icon
            }
        }
    })
})

onMounted(() => {
    // if icons have not yet been loaded, we do so
    if (availableIconSets.value.length === 0) {
        store.dispatch('loadAvailableIconSets')
    }

    // We need to make sure that no drawing features are selected when entering the drawing
    // mode otherwise we cannot edit the selected features.
    store.dispatch('clearAllSelectedFeatures')
    isNewDrawing.value = true

    // if a KML was previously created with the drawing module
    // we add it back for further editing
    if (activeKmlLayer.value) {
        log.debug(`Add current active kml layer to drawing`, activeKmlLayer.value)
        isNewDrawing.value = false
        addKmlLayerToDrawing(activeKmlLayer.value)
    }
    olMap.addLayer(drawingLayer)

    // listening for "Delete" keystroke (to remove last point when drawing lines or measure)
    document.addEventListener('keyup', removeLastPointOnDeleteKeyUp, { passive: true })
    document.addEventListener('contextmenu', removeLastPoint, { passive: true })

    if (IS_TESTING_WITH_CYPRESS) {
        window.drawingLayer = drawingLayer
    }
})
onBeforeUnmount(async () => {
    await store.dispatch('clearAllSelectedFeatures')
    await store.dispatch('setDrawingMode', null)

    drawingLayer.getSource().clear()
    olMap.removeLayer(drawingLayer)

    document.removeEventListener('contextmenu', removeLastPoint)
    document.removeEventListener('keyup', removeLastPointOnDeleteKeyUp)

    if (IS_TESTING_WITH_CYPRESS) {
        delete window.drawingLayer
    }
})

function createSourceForProjection() {
    return new VectorSource({
        useSpatialIndex: false,
        wrapX: true,
        projection: projection.value.epsg,
    })
}
function removeLastPoint() {
    drawingInteractions.value.removeLastPoint()
}

function removeLastPointOnDeleteKeyUp(event) {
    if (event.key === 'Delete') {
        // drawing modes will be checked by the function itself (no need to double-check)
        removeLastPoint()
    }
}

async function closeDrawing() {
    await store.dispatch('setShowLoadingBar', true)

    log.debug(
        `Closing drawing menu: isModified=${isDrawingModified.value}, isNew=${isNewDrawing.value}, isEmpty=${isDrawingEmpty.value}`
    )

    // waiting for any saves that is pending
    await Promise.all(savesInProgress.value)

    // We only trigger a kml save onClose drawing menu when the drawing has been modified and that
    // it is either not empty or not a new drawing.
    // We don't want to save new empty drawing, but we want to allow clearing existing drawing.
    if (isDrawingModified.value && (!isNewDrawing.value || !isDrawingEmpty.value)) {
        await saveDrawing(false)
    }

    await store.dispatch('toggleDrawingOverlay')
    await store.dispatch('setShowLoadingBar', false)
}
</script>

<template>
    <div>
        <DrawingToolbox @remove-last-point="removeLastPoint" @close-drawing="closeDrawing" />
        <DrawingTooltip />
        <DrawingInteractions ref="drawingInteractions" />
    </div>
</template>

<style lang="scss" scoped>
/* Global styles as what is described below will not be wrapped
in this component but added straight the the OpenLayers map */
:global(.cursor-grab) {
    cursor: grab;
}
:global(.cursor-grabbing) {
    cursor: grabbing;
}
:global(.cursor-pointer) {
    cursor: pointer;
}
</style>
