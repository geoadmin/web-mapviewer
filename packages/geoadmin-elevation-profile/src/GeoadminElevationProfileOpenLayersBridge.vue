<script lang="ts" setup>
import type { SingleCoordinate } from '@geoadmin/coordinates'
import type Map from 'ol/Map'

import Overlay from 'ol/Overlay'
import { computed, inject, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue'

import type { GetPointBeingHoveredFunction } from '@/GeoadminElevationProfilePlot.vue'

const { olInstance } = defineProps<{
    olInstance: Map
}>()

const getPointBeingHovered = inject<GetPointBeingHoveredFunction>('getPointBeingHovered')

const coordinate = computed<SingleCoordinate | undefined>(() => {
    if (getPointBeingHovered) {
        return getPointBeingHovered()?.coordinate
    }
    return
})

const overlayAdded = ref<boolean>(false)

const element = document.createElement('div')
element.classList.add(
    'tw:size-[20px]',
    'tw:bg-red-500/75',
    'tw:border-3',
    'tw:border-red-600',
    'tw:rounded-full'
)
// Overlay that shows the corresponding position on the OL map when hovering over the profile graph.
const currentHoverPosOverlay = new Overlay({
    element,
    positioning: 'center-center',
    stopEvent: false,
})
onMounted(() => {
    if (coordinate.value) {
        currentHoverPosOverlay.setPosition(coordinate.value)
        addHoverPositionOverlay()
    }
})
onBeforeUnmount(() => {
    removeHoverPositionOverlay()
})
onUnmounted(() => {
    element.remove()
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
    <slot />
</template>
