<script setup lang="ts">
import type { DrawingInteractionExposed } from '~/types/interactions'

import { useDrawingModeInteraction, useDrawingStore } from '#imports'
import Feature from 'ol/Feature'
import { useI18n } from 'vue-i18n'

const emits = defineEmits<{
    drawEnd: [feature: Feature]
}>()

const { t } = useI18n()

const drawingStore = useDrawingStore()

useDrawingModeInteraction({
    geometryType: 'Point',
    editableFeatureArgs: {
        title: t('@swissgeo/drawing.draw_new_text'),
        textSize: drawingStore.edit.preferred.size,
        textColor: drawingStore.edit.preferred.color,
        featureType: 'ANNOTATION',
    },
    drawEndCallback: (feature) => {
        emits('drawEnd', feature)
    },
})

defineExpose<DrawingInteractionExposed>({
    removeLastPoint: () => {},
})
</script>

<template>
    <slot />
</template>
