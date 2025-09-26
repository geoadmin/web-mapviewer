<script setup lang="ts">
import OLFeature from 'ol/Feature'
import type { SimpleGeometry } from 'ol/geom'
import type { StyleFunction } from 'ol/style/Style'

import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingLineInteraction from '@/modules/drawing/components/useDrawingLineInteraction.composable'
import { drawLineStyle } from '@/modules/drawing/lib/style'

const emits = defineEmits<{
    drawEnd: [feature: OLFeature<SimpleGeometry>]
}>()

const { removeLastPoint } = useDrawingLineInteraction({
    styleFunction: drawLineStyle as StyleFunction,
    featureType: EditableFeatureTypes.LinePolygon,
    drawEndCallback: (feature: OLFeature<SimpleGeometry>): void => {
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
