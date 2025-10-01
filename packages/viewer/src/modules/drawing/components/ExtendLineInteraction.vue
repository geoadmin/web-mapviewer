<script setup lang="ts">
import Feature from 'ol/Feature'
import type { SimpleGeometry } from 'ol/geom'

import useExtendLineInteraction from '@/modules/drawing/components/useExtendLineInteraction.composable'

const { startingFeature } = defineProps<{ startingFeature: Feature<SimpleGeometry> }>()

const emits = defineEmits<{ drawEnd: [feature: Feature<SimpleGeometry>] }>()

const { removeLastPoint } = useExtendLineInteraction({
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
