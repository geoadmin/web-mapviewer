<script setup>
import Feature from 'ol/Feature'
import { useI18n } from 'vue-i18n'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'

const emits = defineEmits({
    drawEnd(payload) {
        return payload instanceof Feature
    },
})

const { t } = useI18n()

useDrawingModeInteraction({
    geometryType: 'Point',
    editableFeatureArgs: {
        title: t('draw_new_text'),
        featureType: EditableFeatureTypes.ANNOTATION,
    },
    drawEndCallback: (feature) => {
        emits('drawEnd', feature)
    },
})
</script>

<template>
    <slot />
</template>
