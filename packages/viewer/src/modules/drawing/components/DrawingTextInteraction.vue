<script setup lang="ts">
import Feature from 'ol/Feature'
import { useI18n } from 'vue-i18n'

import type { DrawingInteractionExposed } from '@/modules/drawing/types/interaction'

import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'

const emits = defineEmits<{
    drawEnd: [feature: Feature]
}>()

const { t } = useI18n()

useDrawingModeInteraction({
    geometryType: 'Point',
    editableFeatureArgs: {
        title: t('draw_new_text'),
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
