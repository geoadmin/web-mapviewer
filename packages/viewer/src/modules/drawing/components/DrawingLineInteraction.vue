<script setup lang="ts">
import type { SimpleGeometry } from 'ol/geom'
import type { StyleFunction } from 'ol/style/Style'

import Feature from 'ol/Feature'

import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingLineInteraction from '@/modules/drawing/components/useDrawingLineInteraction.composable'
import { drawLineStyle } from '@/modules/drawing/lib/style'

type EmitType = {
    (_e: 'drawEnd', _feature: Feature<SimpleGeometry>): void
}
const emits = defineEmits<EmitType>()
const { removeLastPoint } = useDrawingLineInteraction({
    styleFunction: drawLineStyle as StyleFunction,
    featureType: EditableFeatureTypes.LinePolygon,
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
