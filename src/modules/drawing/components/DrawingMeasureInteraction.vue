<script setup>
import Feature from 'ol/Feature'

import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingLineInteraction from '@/modules/drawing/components/useDrawingLineInteraction.composable'
import { drawMeasureStyle } from '@/modules/drawing/lib/style'

const emits = defineEmits({
    drawEnd(payload) {
        return payload instanceof Feature
    },
})

const { removeLastPoint } = useDrawingLineInteraction({
    style: drawMeasureStyle,
    featureType: EditableFeatureTypes.MEASURE,
    drawEndCallback: (feature) => {
        emits('drawEnd', feature)
    },
})

defineExpose({
    removeLastPoint,
})
</script>

<template>
    <slot />
</template>
