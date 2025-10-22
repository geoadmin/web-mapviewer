<script setup lang="ts">
import log from '@swissgeo/log'
import { computed, ref, useTemplateRef } from 'vue'
import type Feature from 'ol/Feature'
import type { ComponentPublicInstance } from 'vue'

import { EditableFeatureTypes } from '@/api/features.api'
import DrawingLineInteraction from '@/modules/drawing/components/DrawingLineInteraction.vue'
import DrawingMarkerInteraction from '@/modules/drawing/components/DrawingMarkerInteraction.vue'
import DrawingMeasureInteraction from '@/modules/drawing/components/DrawingMeasureInteraction.vue'
import DrawingSelectInteraction from '@/modules/drawing/components/DrawingSelectInteraction.vue'
import DrawingTextInteraction from '@/modules/drawing/components/DrawingTextInteraction.vue'
import ExtendLineInteraction from '@/modules/drawing/components/ExtendLineInteraction.vue'
import ExtendMeasureInteraction from '@/modules/drawing/components/ExtendMeasureInteraction.vue'
import useDrawingStore from '@/store/modules/drawing'
import { EditMode } from '@/store/modules/drawing/types/EditMode.enum'

// Methods exposed by the select interaction component
type SelectInteractionExposed = {
    setActive: (_: boolean) => void
    selectFeature: (_: Feature | undefined) => void
    removeLastPoint: () => void
}
// Methods optionally exposed by specialized interactions
type InteractionExposed = { removeLastPoint?: () => void }

// DOM References
const selectInteraction = useTemplateRef<
    ComponentPublicInstance<SelectInteractionExposed> | undefined
>('selectInteraction')
const currentInteraction = useTemplateRef<ComponentPublicInstance<InteractionExposed> | undefined>(
    'currentInteraction'
)
const drawingStore = useDrawingStore()
const currentDrawingMode = computed(() => drawingStore.mode)
const editMode = computed(() => drawingStore.editingMode)

const selectedLineFeature = ref<Feature | undefined>()

const specializedInteractionComponent = computed(() => {
    let selectedInteraction
    switch (currentDrawingMode.value) {
        case EditableFeatureTypes.Annotation:
            selectedInteraction = DrawingTextInteraction
            break
        case EditableFeatureTypes.LinePolygon:
            selectedInteraction = DrawingLineInteraction
            break
        case EditableFeatureTypes.Marker:
            selectedInteraction = DrawingMarkerInteraction
            break
        case EditableFeatureTypes.Measure:
            selectedInteraction = DrawingMeasureInteraction
            break
    }
    if (editMode.value === EditMode.Extend) {
        const isMeasure =
            selectedLineFeature.value?.get('editableFeature')?.featureType ===
            EditableFeatureTypes.Measure
        const isLine =
            selectedLineFeature.value?.get('editableFeature')?.featureType ===
            EditableFeatureTypes.LinePolygon
        if (isMeasure) {
            selectedInteraction = ExtendMeasureInteraction
        } else if (isLine) {
            selectedInteraction = ExtendLineInteraction
        } else {
            log.error('Invalid feature type for extend mode')

            selectedInteraction = undefined
        }
    }
    // Make sure that the modify interaction is disabled when we are in draw / extend mode
    selectInteraction.value?.setActive(!selectedInteraction)
    return selectedInteraction
})

const specializedProps = computed(() => {
    if (editMode.value === EditMode.Extend) {
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
    currentInteraction.value?.removeLastPoint?.()
    if (editMode.value !== EditMode.Off) {
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
defineExpose({
    removeLastPoint,
})
</script>
<template>
    <DrawingSelectInteraction
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
