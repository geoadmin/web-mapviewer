<script setup>
import Feature from 'ol/Feature'

import useContinueLineInteraction from '@/modules/drawing/components/useContinueLineInteraction.composable'
const props = defineProps({
    startingFeature: Feature,
})
const emits = defineEmits({
    drawEnd(payload) {
        return payload instanceof Feature
    },
})
const { removeLastPoint } = useContinueLineInteraction({
    drawEndCallback: (feature) => {
        emits('drawEnd', feature)
    },
    startingFeature: props.startingFeature,
})
defineExpose({
    removeLastPoint,
})
</script>
<template>
    <slot />
</template>
