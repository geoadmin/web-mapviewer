<script setup>
/**
 * Renders all selected features as geometry on the map with a highlighted style and opens up the
 * popup with the features' information
 */

import FeatureEdit from '@/modules/infobox/components/FeatureEdit.vue'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'
import OpenLayersPopover from '@/modules/map/components/openlayers/OpenLayersPopover.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'

// mapping relevant store values
const store = useStore()
const selectedFeatures = computed(() => store.state.features.selectedFeatures)
const isCurrentlyDrawing = computed(() => store.state.ui.showDrawingOverlay)
const isFloatingTooltip = computed(() => store.state.ui.floatingTooltip)

const editableFeatures = computed(() =>
    selectedFeatures.value.filter((feature) => feature.isEditable)
)
const nonEditableFeature = computed(() =>
    selectedFeatures.value.filter((feature) => !feature.isEditable)
)
const popoverCoordinate = computed(() => {
    if (selectedFeatures.value.length > 0) {
        const [firstFeature] = selectedFeatures.value
        let coordinates = [...firstFeature.coordinates]
        if (firstFeature.geometry) {
            coordinates = [...firstFeature.geometry.coordinates]
        }
        return Array.isArray(coordinates[0]) ? coordinates[coordinates.length - 1] : coordinates
    }
    return null
})

const selectedFeatureMarkerPositions = computed(() => {
    return selectedFeatures.value
        .filter((feature) => feature?.geometry?.coordinates)
        .map((feature) => {
            return Array.isArray(feature.geometry.coordinates[0])
                ? feature.geometry.coordinates[feature.geometry.coordinates.length - 1]
                : feature.geometry.coordinates
        })
})

const { zIndexHighlightedFeatures } = useLayerZIndexCalculation()

function clearAllSelectedFeatures() {
    store.dispatch('clearAllSelectedFeatures')
}
function toggleFloatingTooltip() {
    store.dispatch('toggleFloatingTooltip')
}
</script>

<template>
    <OpenLayersMarker
        v-if="selectedFeatures.length > 0"
        :position="selectedFeatureMarkerPositions"
        marker-style="feature"
        :z-index="zIndexHighlightedFeatures"
    />
    <OpenLayersPopover
        v-if="isFloatingTooltip && selectedFeatures.length > 0"
        :coordinates="popoverCoordinate"
        authorize-print
        :use-content-padding="editableFeatures.length > 0"
        @close="clearAllSelectedFeatures"
    >
        <template #extra-buttons>
            <button
                class="btn btn-sm btn-light d-flex align-items-center"
                data-cy="toggle-floating-off"
                @click="toggleFloatingTooltip"
            >
                <FontAwesomeIcon icon="caret-down" />
            </button>
        </template>
        <FeatureEdit
            v-for="feature in editableFeatures"
            :key="feature.id"
            :read-only="!isCurrentlyDrawing"
            :feature="feature"
        />
        <FeatureList :features="nonEditableFeature" direction="column" />
    </OpenLayersPopover>
</template>