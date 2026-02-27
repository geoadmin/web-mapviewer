<script setup lang="ts">
import type { DrawingInteractionExposed } from '~/types/interactions'
import type { SimpleGeometry } from 'ol/geom'

import { useExtendLineInteraction } from '#imports'
import Feature from 'ol/Feature'

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
