<script setup lang="js">
import Feature from 'ol/Feature'

import useExtendLineInteraction from '@/modules/drawing/components/useExtendLineInteraction.composable'

const { startingFeature } = defineProps({
    startingFeature: Feature,
})

const emits = defineEmits({
    drawEnd(payload) {
        return payload instanceof Feature
    },
})

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
