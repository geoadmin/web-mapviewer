<script setup lang="js">
import Feature from 'ol/Feature'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import useExtendLineInteraction from '@/modules/drawing/components/useExtendLineInteraction.composable'
import { drawMeasureStyle } from '@/modules/drawing/lib/style'

const { startingFeature } = defineProps({
    startingFeature: Feature,
})

const emits = defineEmits({
    drawEnd(payload) {
        return payload instanceof Feature
    },
})

const { removeLastPoint } = useExtendLineInteraction({
    featureType: EditableFeatureTypes.MEASURE,
    style: drawMeasureStyle,
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
