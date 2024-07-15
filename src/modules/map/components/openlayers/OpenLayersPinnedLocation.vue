<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'

const store = useStore()
const pinnedLocation = computed(() => store.state.map.pinnedLocation)
const previewedPinnedLocation = computed(() => store.state.map.previewedPinnedLocation)

const { zIndexDroppedPin, zIndexPreviewPosition } = useLayerZIndexCalculation()

const pinnedLocationSelected = ref(false)
const markerStyle = computed(() => {
    if (pinnedLocationSelected.value) {
        // TODO(IS): Find a better way to highlight selected pinned location
        return 'circle'
    } else {
        return 'balloon'
    }
})

function selectFeatureCallback(feature) {
    console.log('Custom callback feature selected:', feature)
    pinnedLocationSelected.value = true
}

function deselectFeatureCallback() {
    console.log('Deselect callback')
    pinnedLocationSelected.value = false
}
</script>

<template>
    <OpenLayersMarker
        v-if="pinnedLocation"
        :position="pinnedLocation"
        :marker-style="markerStyle"
        :z-index="zIndexDroppedPin"
        :select-feature-callback="selectFeatureCallback"
        :deselect-feature-callback="deselectFeatureCallback"
    />
    <OpenLayersMarker
        v-if="previewedPinnedLocation"
        :position="previewedPinnedLocation"
        marker-style="balloon"
        :z-index="zIndexPreviewPosition"
    />
</template>
