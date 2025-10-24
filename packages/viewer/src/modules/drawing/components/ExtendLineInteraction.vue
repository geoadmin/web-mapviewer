<script setup lang="ts">
import type { SimpleGeometry } from 'ol/geom'

import Feature from 'ol/Feature'

import useExtendLineInteraction from '@/modules/drawing/components/useExtendLineInteraction.composable'

const { startingFeature } = defineProps<{ startingFeature: Feature<SimpleGeometry> }>()

type EmitType = {
    (_e: 'drawEnd', _feature: Feature<SimpleGeometry>): void
}
const emits = defineEmits<EmitType>()
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
