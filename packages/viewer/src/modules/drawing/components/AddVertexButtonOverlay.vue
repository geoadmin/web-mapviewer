<script setup lang="ts">
import Overlay from 'ol/Overlay'
import { computed, inject, onMounted, onUnmounted, watch } from 'vue'
import type Map from 'ol/Map'
import log from '@swissgeo/log'

import AddVertexButton from '@/modules/drawing/components/AddVertexButton.vue'
import useFeaturesStore from '@/store/modules/features'
import { EditableFeatureTypes } from '@/api/features.api'

const BASE_OFFSET_DISTANCE = 35
const MEASURE_ADDITIONAL_OFFSET = 40 // additional offset for not covering the measure line label

const { coordinates } = defineProps<{ coordinates: number[][] }>()

const olMap = inject<Map>('olMap')

let firstButtonOverlay: Overlay | undefined
let lastButtonOverlay: Overlay | undefined

const featuresStore = useFeaturesStore()
const selectedEditableFeatures = computed(() => featuresStore.selectedEditableFeatures)
const selectedFeatureType = computed(() => {
    if (selectedEditableFeatures.value && selectedEditableFeatures.value.length > 0) {
        const selectedFeature = selectedEditableFeatures.value[0]
        return selectedFeature?.featureType
    }
    return undefined
})

const calculateOffset = (point1: number[], point2: number[], distance: number) => {
    if (!point1 || !point2 || point1.length < 2 || point2.length < 2) {
        return [distance, -distance]
    }

    // Vector from point1 to point2
    const dx = point2[0]! - point1[0]!
    const dy = point2[1]! - point1[1]!

    // Normalize the vector
    const length = Math.sqrt(dx * dx + dy * dy)
    if (length === 0) {
        return [distance, -distance]
    }

    // Get unit vector in opposite direction
    const ux = -dx / length
    const uy = -dy / length

    // There is minus in y-direction because the y-axis is inverted in the map
    return [ux * distance, -uy * distance]
}

const updateButtonPositions = () => {
    const firstButtonCoordinate = coordinates[0]
    const lastButtonCoordinate = coordinates[coordinates.length - 1]

    if (!firstButtonCoordinate || !lastButtonCoordinate || !coordinates || coordinates.length < 2) {
        log.warn('Not enough coordinates to position the extend buttons')
        return
    }
    const firstOffset = calculateOffset(coordinates[0]!, coordinates[1]!, BASE_OFFSET_DISTANCE)

    const distance =
        BASE_OFFSET_DISTANCE +
        (selectedFeatureType.value === EditableFeatureTypes.Measure ? MEASURE_ADDITIONAL_OFFSET : 0)

    const lastOffset = calculateOffset(
        coordinates[coordinates.length - 1]!,
        coordinates[coordinates.length - 2]!,
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

const onFirstButtonMounted = (buttonElement: HTMLElement) => {
    buttonElement.setAttribute('data-cy', 'extend-from-first-node-button')
    firstButtonOverlay = new Overlay({
        element: buttonElement,
        positioning: 'center-center',
        stopEvent: true,
    })
    olMap?.addOverlay(firstButtonOverlay)
    updateButtonPositions()
}

const onLastButtonMounted = (buttonElement: HTMLElement) => {
    buttonElement.setAttribute('data-cy', 'extend-from-last-node-button')
    lastButtonOverlay = new Overlay({
        element: buttonElement,
        positioning: 'center-center',
        stopEvent: true,
    })
    olMap?.addOverlay(lastButtonOverlay)
    updateButtonPositions()
}

watch(() => coordinates, updateButtonPositions)

onMounted(() => {
    updateButtonPositions()
})

onUnmounted(() => {
    if (firstButtonOverlay) {
        olMap?.removeOverlay(firstButtonOverlay)
    }
    if (lastButtonOverlay) {
        olMap?.removeOverlay(lastButtonOverlay)
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
