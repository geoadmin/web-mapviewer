<script setup lang="ts">
import type { SimpleGeometry } from 'ol/geom'
import type { StyleFunction } from 'ol/style/Style'

import { drawLineStyle, useDrawingLineInteraction } from '#imports'
import Feature from 'ol/Feature'

const emits = defineEmits<{
    drawEnd: [feature: Feature<SimpleGeometry>]
}>()

const { removeLastPoint } = useDrawingLineInteraction({
    styleFunction: drawLineStyle as StyleFunction,
    featureType: 'LINEPOLYGON',
    drawEndCallback: (feature: Feature<SimpleGeometry>): void => {
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
