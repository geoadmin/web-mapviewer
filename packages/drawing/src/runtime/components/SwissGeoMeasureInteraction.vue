<script setup lang="ts">
import type { DrawingInteractionExposed } from '~/types/interactions'
import type { SimpleGeometry } from 'ol/geom'
import type { StyleFunction } from 'ol/style/Style'

import { drawMeasureStyle, useDrawingLineInteraction } from '#imports'
import Feature from 'ol/Feature'

const emits = defineEmits<{
    drawEnd: [feature: Feature<SimpleGeometry>]
}>()

const { removeLastPoint } = useDrawingLineInteraction({
    styleFunction: drawMeasureStyle as StyleFunction,
    featureType: 'MEASURE',
    drawEndCallback: (feature: Feature<SimpleGeometry>): void => {
        emits('drawEnd', feature)
    },
})

defineExpose<DrawingInteractionExposed>({
    removeLastPoint,
})
</script>

<template>
    <slot />
</template>
