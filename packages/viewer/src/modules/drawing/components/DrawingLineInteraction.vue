<script setup lang="ts">
import type { SimpleGeometry } from 'ol/geom'
import type { StyleFunction } from 'ol/style/Style'

import Feature from 'ol/Feature'

import type { DrawingInteractionExposed } from '@/modules/drawing/types/interaction'

import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingLineInteraction from '@/modules/drawing/components/useDrawingLineInteraction.composable'
import { drawLineStyle } from '@/modules/drawing/lib/style'

const emits = defineEmits<{
    drawEnd: [feature: Feature<SimpleGeometry>]
}>()

const { removeLastPoint } = useDrawingLineInteraction({
    styleFunction: drawLineStyle as StyleFunction,
    featureType: EditableFeatureTypes.LinePolygon,
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
