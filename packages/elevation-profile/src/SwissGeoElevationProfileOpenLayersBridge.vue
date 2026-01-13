<script lang="ts" setup>
import type { SingleCoordinate } from '@swissgeo/coordinates'
import type Map from 'ol/Map'
import type { Raw } from 'vue'

import Overlay from 'ol/Overlay'
import { computed, inject, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'

import type { GetPointBeingHoveredFunction } from '@/SwissGeoElevationProfilePlot.vue'

const { olInstance } = defineProps<{
    olInstance: Raw<Map>
}>()

const getPointBeingHovered = inject<GetPointBeingHoveredFunction>('getPointBeingHovered')

const coordinate = computed<SingleCoordinate | undefined>(() => {
    if (getPointBeingHovered) {
        return getPointBeingHovered()?.coordinate
    }
    return undefined
})

const overlayAdded = ref<boolean>(false)

const tooltipElement = useTemplateRef<HTMLDivElement>('tooltipElement')

// Overlay that shows the corresponding position on the OL map when hovering over the profile graph.
const currentHoverPosOverlay = new Overlay({
    positioning: 'center-center',
    stopEvent: false,
})
onMounted(() => {
    if (tooltipElement.value) {
        currentHoverPosOverlay.setElement(tooltipElement.value)
    }
    if (coordinate.value) {
        currentHoverPosOverlay.setPosition(coordinate.value)
        addHoverPositionOverlay()
    }
})
onBeforeUnmount(() => {
    removeHoverPositionOverlay()
})

watch(coordinate, () => {
    currentHoverPosOverlay.setPosition(coordinate.value)
    if (coordinate.value) {
        addHoverPositionOverlay()
    } else {
        removeHoverPositionOverlay()
    }
})

function addHoverPositionOverlay() {
    if (!overlayAdded.value && olInstance) {
        olInstance.addOverlay(currentHoverPosOverlay)
        overlayAdded.value = true
    }
}
function removeHoverPositionOverlay() {
    if (overlayAdded.value && olInstance) {
        olInstance.removeOverlay(currentHoverPosOverlay)
        overlayAdded.value = false
    }
}
</script>

<template>
    <div
        ref="tooltipElement"
        class="tw:size-5 tw:bg-red-500/75 tw:border-3 tw:border-red-600 tw:rounded-full"
    ></div>
    <slot />
</template>
