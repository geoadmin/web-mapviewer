<script setup lang="ts">
import type { SimpleGeometry } from 'ol/geom'
import type { StyleFunction } from 'ol/style/Style'

import Feature from 'ol/Feature'

import { EditableFeatureTypes } from '@/api/features.api'
import useExtendLineInteraction from '@/modules/drawing/components/useExtendLineInteraction.composable'
import { drawMeasureStyle } from '@/modules/drawing/lib/style'

const { startingFeature } = defineProps<{ startingFeature: Feature<SimpleGeometry> }>()

type EmitType = {
    (_e: 'drawEnd', _feature: Feature<SimpleGeometry>): void
}
const emits = defineEmits<EmitType>()

const { removeLastPoint } = useExtendLineInteraction({
    featureType: EditableFeatureTypes.Measure,
    style: drawMeasureStyle as StyleFunction,
    drawEndCallback: (feature) => {
        emits('drawEnd', feature)
    },
    startingFeature: () => startingFeature,
})

defineExpose({
    removeLastPoint,
})
</script>
<template>
    <slot />
</template>
