<script setup lang="ts">
import Feature from 'ol/Feature'
import { useI18n } from 'vue-i18n'

import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'

type EmitType = {
    (_e: 'drawEnd', _feature: Feature): void
}
const emits = defineEmits<EmitType>()

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
</script>

<template>
    <slot />
</template>
