<script setup>
import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'
import Feature from 'ol/Feature'
import { defineEmits, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const emits = defineEmits({
    drawEnd(payload) {
        return payload instanceof Feature
    },
})

const i18n = useI18n()

const { lastFinishedFeature } = useDrawingModeInteraction({
    geometryType: 'Point',
    editableFeatureArgs: {
        title: i18n.t('draw_new_text'),
        featureType: EditableFeatureTypes.ANNOTATION,
    },
})
watch(lastFinishedFeature, (newFinishedFeature) => {
    emits('drawEnd', newFinishedFeature)
})

defineExpose({
    lastFinishedFeature,
})
</script>

<template>
    <slot />
</template>
