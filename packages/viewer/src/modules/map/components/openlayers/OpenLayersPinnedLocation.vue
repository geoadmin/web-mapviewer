<script setup lang="ts">
import { computed } from 'vue'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'
import { OpenLayersMarkerStyles } from '@/modules/map/components/openlayers/utils/markerStyle'
import useMapStore from '@/store/modules/map.store'

const mapStore = useMapStore()

const pinnedLocation = computed(() => mapStore.pinnedLocation)
const previewedPinnedLocation = computed(() => mapStore.previewedPinnedLocation)

const { zIndexDroppedPin, zIndexPreviewPosition } = useLayerZIndexCalculation()

const dispatcher = { name: 'OpenLayersPinnedLocation.vue' }

function selectFeatureCallback(): void {
    mapStore.setLocationPopupCoordinates(pinnedLocation.value, dispatcher)
}
</script>

<template>
    <OpenLayersMarker
        v-if="pinnedLocation"
        :position="pinnedLocation"
        :marker-style="OpenLayersMarkerStyles.Balloon"
        :z-index="zIndexDroppedPin"
        :deselect-after-select="true"
        :select-feature-callback="selectFeatureCallback"
    />
    <OpenLayersMarker
        v-if="previewedPinnedLocation"
        :position="previewedPinnedLocation"
        :marker-style="OpenLayersMarkerStyles.Balloon"
        :z-index="zIndexPreviewPosition"
    />
</template>
