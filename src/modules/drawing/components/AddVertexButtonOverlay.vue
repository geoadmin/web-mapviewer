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

const updateButtonPositions = () => {
    const coordinates = props.lineString.coordinates
    firstButtonCoordinate.value = coordinates[0]
    lastButtonCoordinate.value = coordinates[coordinates.length - 1]
    if (firstButtonOverlay.value) {
        firstButtonOverlay.value.setPosition(firstButtonCoordinate.value)
    }
    if (lastButtonOverlay.value) {
        lastButtonOverlay.value.setPosition(lastButtonCoordinate.value)
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
    <AddVertexButton :tooltip-text="'Add vertex at start'" @button-mounted="onFirstButtonMounted" />
    <AddVertexButton :tooltip-text="'Add vertex at end'" @button-mounted="onLastButtonMounted" />
</template>
