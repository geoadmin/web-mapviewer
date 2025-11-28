<script setup lang="ts">
import type { SimpleGeometry } from 'ol/geom'

import Feature from 'ol/Feature'

import type { DrawingInteractionExposed } from '@/modules/drawing/types/interaction'

import useExtendLineInteraction from '@/modules/drawing/components/useExtendLineInteraction.composable'

const { startingFeature } = defineProps<{ startingFeature: Feature<SimpleGeometry> }>()

const emits = defineEmits<{
    drawEnd: [feature: Feature<SimpleGeometry>]
}>()

const { removeLastPoint } = useExtendLineInteraction({
    drawEndCallback: (feature) => {
        emits('drawEnd', feature)
    },
    startingFeature: () => startingFeature,
})

defineExpose<DrawingInteractionExposed>({
    removeLastPoint,
})
</script>
<template>
    <slot />
</template>
