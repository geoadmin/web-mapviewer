<script setup>
import Feature from 'ol/Feature'

import useExtendLineInteraction from '@/modules/drawing/components/useExtendLineInteraction.composable'
const props = defineProps({
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
    startingFeature: props.startingFeature,
})
defineExpose({
    removeLastPoint,
})
</script>
<template>
    <slot />
</template>
