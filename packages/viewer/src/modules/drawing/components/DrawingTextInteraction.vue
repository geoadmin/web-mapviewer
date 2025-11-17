<script setup lang="ts">
import Feature from 'ol/Feature'
import { useI18n } from 'vue-i18n'

import type { DrawingInteractionExposed } from '@/modules/drawing/types/interaction'

import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'
import useDrawingStore from '@/store/modules/drawing'

const emits = defineEmits<{
    drawEnd: [feature: Feature]
}>()

const { t } = useI18n()

const drawingStore = useDrawingStore()

useDrawingModeInteraction({
    geometryType: 'Point',
    editableFeatureArgs: {
        title: t('draw_new_text'),
        textSize: drawingStore.edit.preferred.size,
        textColor: drawingStore.edit.preferred.color,
        featureType: EditableFeatureTypes.Annotation,
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
