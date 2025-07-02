<script setup>
import log from '@geoadmin/log'
import { computed, ref, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import DrawingLineInteraction from '@/modules/drawing/components/DrawingLineInteraction.vue'
import DrawingMarkerInteraction from '@/modules/drawing/components/DrawingMarkerInteraction.vue'
import DrawingMeasureInteraction from '@/modules/drawing/components/DrawingMeasureInteraction.vue'
import DrawingSelectInteraction from '@/modules/drawing/components/DrawingSelectInteraction.vue'
import DrawingTextInteraction from '@/modules/drawing/components/DrawingTextInteraction.vue'
import ExtendLineInteraction from '@/modules/drawing/components/ExtendLineInteraction.vue'
import ExtendMeasureInteraction from '@/modules/drawing/components/ExtendMeasureInteraction.vue'
import { EditMode } from '@/store/modules/drawing.store'

// DOM References
const selectInteraction = useTemplateRef('selectInteraction')
const currentInteraction = useTemplateRef('currentInteraction')
const store = useStore()
const currentDrawingMode = computed(() => store.state.drawing.mode)
const editMode = computed(() => store.state.drawing.editingMode)

const selectedLineFeature = ref(null)

const specializedInteractionComponent = computed(() => {
    let selectedInteraction = null
    switch (currentDrawingMode.value) {
        case EditableFeatureTypes.ANNOTATION:
            selectedInteraction = DrawingTextInteraction
            break
        case EditableFeatureTypes.LINEPOLYGON:
            selectedInteraction = DrawingLineInteraction
            break
        case EditableFeatureTypes.MARKER:
            selectedInteraction = DrawingMarkerInteraction
            break
        case EditableFeatureTypes.MEASURE:
            selectedInteraction = DrawingMeasureInteraction
            break
    }
    if (editMode.value === EditMode.EXTEND) {
        const isMeasure =
            selectedLineFeature.value?.get('editableFeature')?.featureType ===
            EditableFeatureTypes.MEASURE
        const isLine =
            selectedLineFeature.value?.get('editableFeature')?.featureType ===
            EditableFeatureTypes.LINEPOLYGON
        if (isMeasure) {
            selectedInteraction = ExtendMeasureInteraction
        } else if (isLine) {
            selectedInteraction = ExtendLineInteraction
        } else {
            log.error('Invalid feature type for extend mode')

            selectedInteraction = null
        }
    }
    // Make sure that the modify interaction is disabled when we are in draw / extend mode
    selectInteraction.value?.setActive(!selectedInteraction)
    return selectedInteraction
})

const specializedProps = computed(() => {
    if (editMode.value === EditMode.EXTEND) {
        return {
            startingFeature: selectedLineFeature.value,
        }
    }
    return {}
})

function onDrawEnd(feature) {
    selectInteraction.value.selectFeature(feature)
}

function removeLastPoint() {
    if (currentInteraction.value?.removeLastPoint) {
        currentInteraction.value.removeLastPoint()
    }
    if (editMode.value !== EditMode.OFF) {
        selectInteraction.value.removeLastPoint()
    }
}

function featureSelected(feature) {
    if (feature?.getGeometry()?.getType() === 'LineString') {
        selectedLineFeature.value = feature
    } else {
        selectedLineFeature.value = null
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
