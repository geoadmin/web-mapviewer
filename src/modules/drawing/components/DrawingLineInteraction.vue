<script setup>
import Feature from 'ol/Feature'
import { watch } from 'vue'

import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingLineInteraction from '@/modules/drawing/components/useDrawingLineInteraction.composable'
import { drawLineStyle } from '@/modules/drawing/lib/style'

const emits = defineEmits({
    drawEnd(payload) {
        return payload instanceof Feature
    },
})

const { removeLastPoint, lastFinishedFeature } = useDrawingLineInteraction({
    style: drawLineStyle,
    featureType: EditableFeatureTypes.LINEPOLYGON,
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
