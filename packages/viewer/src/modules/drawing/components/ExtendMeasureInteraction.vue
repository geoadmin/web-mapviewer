<script setup lang="ts">
import Feature from 'ol/Feature'
import type { SimpleGeometry } from 'ol/geom'

import { EditableFeatureTypes } from '@/api/features.api'
import useExtendLineInteraction from '@/modules/drawing/components/useExtendLineInteraction.composable'
import { drawMeasureStyle } from '@/modules/drawing/lib/style'
import type { StyleFunction } from 'ol/style/Style'

const { startingFeature } = defineProps<{ startingFeature: Feature<SimpleGeometry> }>()

const emits = defineEmits<{ drawEnd: [feature: Feature<SimpleGeometry>] }>()

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
