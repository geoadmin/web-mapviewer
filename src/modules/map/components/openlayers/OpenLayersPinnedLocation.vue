<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'

const store = useStore()

const pinnedLocation = computed(() => store.state.map.pinnedLocation)
const previewedPinnedLocation = computed(() => store.state.map.previewedPinnedLocation)

const { zIndexDroppedPin, zIndexPreviewPosition } = useLayerZIndexCalculation()

const dispatcher = { dispatcher: 'OpenLayersPinnedLocation.vue' }

function selectFeatureCallback() {
    store.dispatch('setLocationPopupCoordinates', {
        coordinates: pinnedLocation.value,
        dispatcher,
    })
}
</script>

<template>
    <OpenLayersMarker
        v-if="pinnedLocation"
        :position="pinnedLocation"
        marker-style="balloon"
        :z-index="zIndexDroppedPin"
        :deselect-after-select="true"
        :select-feature-callback="selectFeatureCallback"
    />
    <OpenLayersMarker
        v-if="previewedPinnedLocation"
        :position="previewedPinnedLocation"
        marker-style="balloon"
        :z-index="zIndexPreviewPosition"
    />
</template>
