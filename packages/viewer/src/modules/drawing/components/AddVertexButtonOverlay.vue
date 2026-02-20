<script setup lang="js">
import Overlay from 'ol/Overlay'
import { computed, inject, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'

import AddVertexButton from '@/modules/drawing/components/AddVertexButton.vue'

const BASE_OFFSET_DISTANCE = 35
const MEASURE_ADDITIONAL_OFFSET = 40 // additional offset for not covering the measure line label

const { coordinates } = defineProps({
    coordinates: {
        type: Array,
        required: true,
        validator: (value) => {
            return (
                Array.isArray(value) &&
                value.length >= 2 &&
                value.every(
                    (coord) => Array.isArray(coord) && (coord.length === 2 || coord.length === 3)
                )
            )
        },
    },
})

const olMap = inject('olMap')

let firstButtonOverlay = null
let lastButtonOverlay = null

const store = useStore()
const selectedEditableFeatures = computed(() => store.state.features.selectedEditableFeatures)
const selectedFeatureType = computed(() => {
    if (selectedEditableFeatures.value && selectedEditableFeatures.value.length > 0) {
        const selectedFeature = selectedEditableFeatures.value[0]
        return selectedFeature.featureType
    }
    return null
})

const calculateOffset = (point1, point2, distance) => {
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
    const firstButtonCoordinate = coordinates[0]
    const lastButtonCoordinate = coordinates[coordinates.length - 1]

    const firstOffset = calculateOffset(coordinates[0], coordinates[1], BASE_OFFSET_DISTANCE)

    const distance =
        BASE_OFFSET_DISTANCE +
        (selectedFeatureType.value === 'MEASURE' ? MEASURE_ADDITIONAL_OFFSET : 0)

    const lastOffset = calculateOffset(
        coordinates[coordinates.length - 1],
        coordinates[coordinates.length - 2],
        distance
    )

    if (firstButtonOverlay) {
        firstButtonOverlay.setPosition(firstButtonCoordinate)
        firstButtonOverlay.setOffset(firstOffset)
    }
    if (lastButtonOverlay) {
        lastButtonOverlay.setPosition(lastButtonCoordinate)
        lastButtonOverlay.setOffset(lastOffset)
    }
}

const onFirstButtonMounted = (buttonElement) => {
    buttonElement.setAttribute('data-cy', 'extend-from-first-node-button')
    firstButtonOverlay = new Overlay({
        element: buttonElement,
        positioning: 'center-center',
        stopEvent: true,
    })
    olMap.addOverlay(firstButtonOverlay)
    updateButtonPositions()
}

const onLastButtonMounted = (buttonElement) => {
    buttonElement.setAttribute('data-cy', 'extend-from-last-node-button')
    lastButtonOverlay = new Overlay({
        element: buttonElement,
        positioning: 'center-center',
        stopEvent: true,
    })
    olMap.addOverlay(lastButtonOverlay)
    updateButtonPositions()
}

watch(() => coordinates, updateButtonPositions)

onMounted(() => {
    updateButtonPositions()
})

onUnmounted(() => {
    if (firstButtonOverlay) {
        olMap.removeOverlay(firstButtonOverlay)
    }
    if (lastButtonOverlay) {
        olMap.removeOverlay(lastButtonOverlay)
    }
})
</script>

<template>
    <AddVertexButton
        :reverse="true"
        @button-mounted="onFirstButtonMounted"
    />
    <AddVertexButton
        :reverse="false"
        @button-mounted="onLastButtonMounted"
    />
</template>
