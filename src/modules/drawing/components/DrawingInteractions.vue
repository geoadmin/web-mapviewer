<script setup>
import { EditableFeatureTypes } from '@/api/features.api'
import DrawingLineInteraction from '@/modules/drawing/components/DrawingLineInteraction.vue'
import DrawingMarkerInteraction from '@/modules/drawing/components/DrawingMarkerInteraction.vue'
import DrawingMeasureInteraction from '@/modules/drawing/components/DrawingMeasureInteraction.vue'
import DrawingSelectInteraction from '@/modules/drawing/components/DrawingSelectInteraction.vue'
import DrawingTextInteraction from '@/modules/drawing/components/DrawingTextInteraction.vue'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

// DOM References
const selectInteraction = ref(null)
const currentInteraction = ref(null)

const store = useStore()
const currentDrawingMode = computed(() => store.state.drawing.mode)

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
    return null
})

function onDrawEnd(feature) {
    selectInteraction.value.selectFeature(feature)
}

function removeLastPoint() {
    if (currentInteraction.value?.removeLastPoint) {
        currentInteraction.value.removeLastPoint()
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
        @draw-end="onDrawEnd"
    />
</template>

<style lang="scss" scoped>
// So that the text in the mouse tooltip can't be selected
:global(.ol-overlay-container) {
    user-select: none;
}
</style>
