<script setup>
import Feature from 'ol/Feature'
import { watch } from 'vue'

import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingLineInteraction from '@/modules/drawing/components/useDrawingLineInteraction.composable'
import { drawMeasureStyle } from '@/modules/drawing/lib/style'

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
