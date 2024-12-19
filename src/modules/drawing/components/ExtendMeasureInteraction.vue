<script setup>
import Feature from 'ol/Feature'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import useContinueLineInteraction from '@/modules/drawing/components/useContinueLineInteraction.composable'
import { drawMeasureStyle } from '@/modules/drawing/lib/style'

const props = defineProps({
    startingFeature: Feature,
})
const emits = defineEmits({
    drawEnd(payload) {
        return payload instanceof Feature
    },
})
const { removeLastPoint } = useContinueLineInteraction({
    featureType: EditableFeatureTypes.MEASURE,
    style: drawMeasureStyle,
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
