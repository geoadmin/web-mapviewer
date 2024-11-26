<script setup>
import Overlay from 'ol/Overlay'
import { computed, onMounted, ref, watch } from 'vue'
import { inject } from 'vue'
import { onUnmounted } from 'vue'
import { useStore } from 'vuex'

import AddVertexButton from '@/modules/drawing/components/AddVertexButton.vue'

const BASE_OFFSET_DISTANCE = 35
const MEASURE_ADDITIONAL_OFFSET = 40 // additional offset for not covering the measure line label

const props = defineProps({
    coordinates: {
        type: Array,
        required: true,
        validator: (value) => {
            return (
                Array.isArray(value) &&
                value.length >= 2 &&
                value.every((coord) => Array.isArray(coord) && coord.length === 2)
            )
        },
    },
})

const olMap = inject('olMap')

const firstButtonOverlay = ref(null)
const lastButtonOverlay = ref(null)

const firstButtonCoordinate = ref(null)
const lastButtonCoordinate = ref(null)

const store = useStore()
const coordinates = computed(() => props.coordinates)
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
    const coords = coordinates.value
    firstButtonCoordinate.value = coords[0]
    lastButtonCoordinate.value = coords[coords.length - 1]

    const firstOffset = calculateOffset(coords[0], coords[1], BASE_OFFSET_DISTANCE)

    // adding this so that the button is not on top of the measure line label
    const distance =
        selectedFeatureType.value === 'MEASURE'
            ? BASE_OFFSET_DISTANCE + MEASURE_ADDITIONAL_OFFSET
            : BASE_OFFSET_DISTANCE
    const lastOffset = calculateOffset(
        coords[coords.length - 1],
        coords[coords.length - 2],
        distance
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
    })
    olMap.addOverlay(firstButtonOverlay.value)
    updateButtonPositions()
}

const onLastButtonMounted = (buttonElement) => {
    lastButtonOverlay.value = new Overlay({
        element: buttonElement,
        positioning: 'center-center',
        stopEvent: true,
    })
    olMap.addOverlay(lastButtonOverlay.value)
    updateButtonPositions()
}

watch(coordinates, updateButtonPositions)

onMounted(() => {
    updateButtonPositions()
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
