<script setup>
import Feature from 'ol/Feature'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import useDrawingLineInteraction from '@/modules/drawing/components/useDrawingLineInteraction.composable'
import { drawMeasureStyle } from '@/modules/drawing/lib/style'

const emits = defineEmits({
    drawEnd(payload) {
        return payload instanceof Feature
    },
})

const { removeLastPoint } = useDrawingLineInteraction({
    style: drawMeasureStyle,
    featureType: EditableFeatureTypes.MEASURE,
    drawEndCallback: (feature) => {
        emits('drawEnd', feature)
    },
})

defineExpose({
    removeLastPoint,
})
</script>

<template>
    <!-- This div is used to add a single root element to the component to prevent warnings in Vue 3.
    See https://mokkapps.de/vue-tips/use-fallthrough-attributes for more details. -->
    <div>
        <slot />
    </div>
</template>
