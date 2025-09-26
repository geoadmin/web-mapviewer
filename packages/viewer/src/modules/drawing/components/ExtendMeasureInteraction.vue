<script setup lang="js">
import Feature from 'ol/Feature'

import { EditableFeatureTypes } from '@/api/features.api'
import useExtendLineInteraction from '@/modules/drawing/components/useExtendLineInteraction.composable'
import { drawMeasureStyle } from '@/modules/drawing/lib/style.js'

const { startingFeature } = defineProps({
    startingFeature: Feature,
})

const emits = defineEmits({
    drawEnd(payload) {
        return payload instanceof Feature
    },
})

const { removeLastPoint } = useExtendLineInteraction({
    featureType: EditableFeatureTypes.Measure,
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
