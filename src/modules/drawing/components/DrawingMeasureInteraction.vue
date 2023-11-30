<script setup>
import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingLineInteraction from '@/modules/drawing/components/useDrawingLineInteraction.composable'
import { drawMeasureStyle } from '@/modules/drawing/lib/style'
import Feature from 'ol/Feature'
import { defineEmits, watch } from 'vue'

const emits = defineEmits({
    drawEnd(payload) {
        return payload instanceof Feature
    },
})

const { removeLastPoint, lastFinishedFeature } = useDrawingLineInteraction({
    style: drawMeasureStyle,
    featureType: EditableFeatureTypes.MEASURE,
})
watch(lastFinishedFeature, (newFinishedFeature) => {
    emits('drawEnd', newFinishedFeature)
})

defineExpose({
    removeLastPoint,
    lastFinishedFeature,
})
</script>

<template>
    <slot />
</template>
