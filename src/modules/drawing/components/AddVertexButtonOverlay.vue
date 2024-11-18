<script setup>
import { LineString } from 'ol/geom'
import Overlay from 'ol/Overlay'
import { onMounted, ref, watch } from 'vue'
import { inject } from 'vue'
import { onUnmounted } from 'vue'

import AddVertexButton from './AddVertexButton.vue'

const props = defineProps({
    lineString: {
        type: LineString,
        required: true,
    },
})

const olMap = inject('olMap')

const firstButtonOverlay = ref(null)
const lastButtonOverlay = ref(null)

const firstButtonCoordinate = ref(null)
const lastButtonCoordinate = ref(null)

const calculateOffset = (point1, point2, distance = 35) => {
    if (!point1 || !point2) {
        return [distance, -distance]
    }

    // Vector from point1 to point2
    const dx = point2[0] - point1[0]
    const dy = point2[1] - point1[1]

    // Normalize the vector
    const length = Math.sqrt(dx * dx + dy * dy)
    if (length === 0) return [distance, -distance]

    // Get unit vector in opposite direction
    const ux = -dx / length
    const uy = -dy / length

    // There is minus in y-direction because the y-axis is inverted in the map
    return [ux * distance, -uy * distance]
}

const updateButtonPositions = () => {
    const coordinates = props.lineString.coordinates
    firstButtonCoordinate.value = coordinates[0]
    lastButtonCoordinate.value = coordinates[coordinates.length - 1]

    const firstOffset = calculateOffset(coordinates[0], coordinates[1])
    const lastOffset = calculateOffset(
        coordinates[coordinates.length - 1],
        coordinates[coordinates.length - 2]
    )

    if (firstButtonOverlay.value) {
        firstButtonOverlay.value.setPosition(firstButtonCoordinate.value)
        firstButtonOverlay.value.setOffset(firstOffset)
    }
    if (lastButtonOverlay.value) {
        lastButtonOverlay.value.setPosition(lastButtonCoordinate.value)
        lastButtonOverlay.value.setOffset(lastOffset)
    }
}

const onFirstButtonMounted = (buttonElement) => {
    firstButtonOverlay.value = new Overlay({
        element: buttonElement,
        positioning: 'center-center',
        stopEvent: true,
        offset: [-25, -25], // TODO: make this dynamic according to the next point
    })
    olMap.addOverlay(firstButtonOverlay.value)
    updateButtonPositions()
}

const onLastButtonMounted = (buttonElement) => {
    lastButtonOverlay.value = new Overlay({
        element: buttonElement,
        positioning: 'center-center',
        stopEvent: true,
        offset: [-25, -25], // TODO: make this dynamic according to the next point
    })
    olMap.addOverlay(lastButtonOverlay.value)
    updateButtonPositions()
}

onMounted(() => {
    updateButtonPositions()
    watch(() => props.lineString.coordinates, updateButtonPositions)
})

onUnmounted(() => {
    if (firstButtonOverlay.value) {
        olMap.removeOverlay(firstButtonOverlay.value)
    }
    if (lastButtonOverlay.value) {
        olMap.removeOverlay(lastButtonOverlay.value)
    }
})
</script>

<template>
    <AddVertexButton :reverse="true" @button-mounted="onFirstButtonMounted" />
    <AddVertexButton :reverse="false" @button-mounted="onLastButtonMounted" />
</template>
