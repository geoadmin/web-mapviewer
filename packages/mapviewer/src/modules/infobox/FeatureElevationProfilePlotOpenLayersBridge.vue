<script setup>
import Overlay from 'ol/Overlay'
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { FeatureStyleColor, RED } from '@/utils/featureStyleUtils'

const { coordinates, trackingPointColor } = defineProps({
    coordinates: {
        type: Array,
        default: null,
    },
    trackingPointColor: {
        type: FeatureStyleColor,
        default: RED,
    },
})

const olMap = inject('olMap')

const currentHoverPosOverlay = ref(null)

onMounted(() => {
    // Overlay that shows the corresponding position on the OL map when hovering over the profile graph.
    currentHoverPosOverlay.value = new Overlay({
        element: document.createElement('div'),
        positioning: 'center-center',
        stopEvent: false,
    })
    // setting up a CSS class on the element so that we can style it (see below in the <style> section)
    currentHoverPosOverlay.value.getElement().classList.add('profile-circle-current-hover-pos')
    currentHoverPosOverlay.value.getElement().style.backgroundColor = trackingPointColor.fill
    if (coordinates) {
        currentHoverPosOverlay.value.setPosition(coordinates)
        addHoverPositionOverlay()
    }
})
onBeforeUnmount(() => {
    removeHoverPositionOverlay()
})

watch(
    () => coordinates,
    (newCoordinates) => {
        if (newCoordinates) {
            currentHoverPosOverlay.value.setPosition(newCoordinates)
            addHoverPositionOverlay()
        } else {
            currentHoverPosOverlay.value.setPosition(null)
            removeHoverPositionOverlay()
        }
    }
)
watch(
    () => trackingPointColor,
    (newColor) => {
        currentHoverPosOverlay.value.getElement().style.backgroundColor = newColor.fill
    }
)

function addHoverPositionOverlay() {
    olMap?.addOverlay(currentHoverPosOverlay.value)
}
function removeHoverPositionOverlay() {
    olMap?.removeOverlay(currentHoverPosOverlay.value)
}
</script>

<template>
    <slot />
</template>
