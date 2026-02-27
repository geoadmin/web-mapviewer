<script setup lang="ts">
import type { ActionDispatcher } from '@/store/types'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'
import useMapStore from '@/store/modules/map'

const mapStore = useMapStore()

const { zIndexDroppedPin, zIndexPreviewPosition } = useLayerZIndexCalculation()

const dispatcher: ActionDispatcher = { name: 'OpenLayersPinnedLocation.vue' }

function selectFeatureCallback(): void {
    mapStore.setLocationPopupCoordinates(mapStore.pinnedLocation, dispatcher)
}
</script>

<template>
    <OpenLayersMarker
        v-if="mapStore.pinnedLocation"
        :position="mapStore.pinnedLocation"
        marker-style="balloon"
        :z-index="zIndexDroppedPin"
        :deselect-after-select="true"
        :select-feature-callback="selectFeatureCallback"
    />
    <OpenLayersMarker
        v-if="mapStore.previewedPinnedLocation"
        :position="mapStore.previewedPinnedLocation"
        marker-style="balloon"
        :z-index="zIndexPreviewPosition"
    />
</template>
