<script setup lang="ts">
import type { DrawingInteractionExposed, SelectInteractionExposed } from '~/types/interactions'
import type Feature from 'ol/Feature'
import type { Component, ComponentPublicInstance } from 'vue'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import {
    SwissGeoExtendLineInteraction,
    SwissGeoExtendMeasureInteraction,
    SwissGeoLineInteraction,
    SwissGeoMarkerInteraction,
    SwissGeoMeasureInteraction,
    SwissGeoTextInteraction,
} from '#components'
import { useDrawingStore } from '#imports'
import { computed, ref, useTemplateRef } from 'vue'

const selectInteraction =
    useTemplateRef<ComponentPublicInstance<SelectInteractionExposed>>('selectInteraction')
const currentInteraction =
    useTemplateRef<ComponentPublicInstance<DrawingInteractionExposed>>('currentInteraction')
const drawingStore = useDrawingStore()

const selectedLineFeature = ref<Feature | undefined>()

const specializedInteractionComponent = computed<Component | undefined>(() => {
    let selectedInteraction
    switch (drawingStore.edit.featureType) {
        case 'ANNOTATION':
            selectedInteraction = SwissGeoTextInteraction
            break
        case 'LINEPOLYGON':
            selectedInteraction = SwissGeoLineInteraction
            break
        case 'MARKER':
            selectedInteraction = SwissGeoMarkerInteraction
            break
        case 'MEASURE':
            selectedInteraction = SwissGeoMeasureInteraction
            break
    }
    if (drawingStore.edit.mode === 'EXTEND') {
        const isMeasure =
            selectedLineFeature.value?.get('editableFeature')?.featureType === 'MEASURE'
        const isLine =
            selectedLineFeature.value?.get('editableFeature')?.featureType === 'LINEPOLYGON'
        if (isMeasure) {
            selectedInteraction = SwissGeoExtendMeasureInteraction
        } else if (isLine) {
            selectedInteraction = SwissGeoExtendLineInteraction
        } else {
            log.error({
                title: 'DrawingInteractions.vue',
                titleColor: LogPreDefinedColor.Lime,
                messages: ['Invalid feature type for extend mode'],
            })

            selectedInteraction = undefined
        }
    }
    // Make sure that the select interaction is disabled when we are in draw / extend mode
    selectInteraction.value?.setActive(!selectedInteraction)
    return selectedInteraction
})

const specializedProps = computed(() => {
    if (drawingStore.edit.mode === 'EXTEND') {
        return {
            startingFeature: selectedLineFeature.value,
        }
    }
    return {}
})

function onDrawEnd(feature: Feature | undefined) {
    selectInteraction.value?.selectFeature(feature)
}

function removeLastPoint() {
    currentInteraction.value?.removeLastPoint()
    if (drawingStore.edit.mode !== 'OFF') {
        selectInteraction.value?.removeLastPoint()
    }
}

function featureSelected(feature: Feature | undefined) {
    if (feature?.getGeometry()?.getType() === 'LineString') {
        selectedLineFeature.value = feature
    } else {
        selectedLineFeature.value = undefined
    }
}
defineExpose<DrawingInteractionExposed>({
    removeLastPoint,
})
</script>
<template>
    <SwissGeoSelectInteraction
        ref="selectInteraction"
        @feature-selected="featureSelected"
    />
    <component
        :is="specializedInteractionComponent"
        v-if="specializedInteractionComponent"
        ref="currentInteraction"
        v-bind="specializedProps"
        @draw-end="onDrawEnd"
    />
</template>
<style lang="scss" scoped>
// So that the text in the mouse tooltip can't be selected
:global(.ol-overlay-container) {
    user-select: none;
}
</style>
