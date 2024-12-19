<script setup>
import { computed, ref } from 'vue'
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
const selectInteraction = ref(null)
const currentInteraction = ref(null)
const store = useStore()
const currentDrawingMode = computed(() => store.state.drawing.mode)
const editMode = computed(() => store.state.drawing.editingMode)
let selectedLineFeature = null
const specializedInteractionComponent = computed(() => {
    switch (currentDrawingMode.value) {
        case EditableFeatureTypes.ANNOTATION:
            return DrawingTextInteraction
        case EditableFeatureTypes.LINEPOLYGON:
            return DrawingLineInteraction
        case EditableFeatureTypes.MARKER:
            return DrawingMarkerInteraction
        case EditableFeatureTypes.MEASURE:
            return DrawingMeasureInteraction
    }
    if (editMode.value === EditMode.EXTEND) {
        const isMeasure =
            selectedLineFeature?.get('editableFeature')?.featureType ===
            EditableFeatureTypes.MEASURE
        if (isMeasure) {
            return ExtendMeasureInteraction
        } else {
            return ExtendLineInteraction
        }
    }
    return null
})
function onDrawEnd(feature) {
    selectInteraction.value.selectFeature(feature)
    selectedLineFeature = feature
}
function removeLastPoint() {
    if (currentInteraction.value?.removeLastPoint) {
        currentInteraction.value.removeLastPoint()
    }
    if (editMode.value !== EditMode.OFF) {
        selectInteraction.value.removeLastPoint()
    }
}
defineExpose({
    removeLastPoint,
})
</script>
<template>
    <DrawingSelectInteraction ref="selectInteraction" />
    <component
        :is="specializedInteractionComponent"
        v-if="specializedInteractionComponent"
        ref="currentInteraction"
        :starting-feature="selectedLineFeature"
        @draw-end="onDrawEnd"
    />
</template>
<style lang="scss" scoped>
// So that the text in the mouse tooltip can't be selected
:global(.ol-overlay-container) {
    user-select: none;
}
</style>
