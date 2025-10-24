<script setup lang="ts">
import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'
import { OpenLayersMarkerStyles } from '@/modules/map/components/openlayers/utils/markerStyle'
import useMapStore from '@/store/modules/map'
import type { ActionDispatcher } from '@/store/types'

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
        :marker-style="OpenLayersMarkerStyles.Balloon"
        :z-index="zIndexDroppedPin"
        :deselect-after-select="true"
        :select-feature-callback="selectFeatureCallback"
    />
    <OpenLayersMarker
        v-if="mapStore.previewedPinnedLocation"
        :position="mapStore.previewedPinnedLocation"
        :marker-style="OpenLayersMarkerStyles.Balloon"
        :z-index="zIndexPreviewPosition"
    />
</template>
