<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { EditableFeatureTypes } from '@/api/features.api'
import useUIStore from '@/store/modules/ui.store'
import useDrawingStore from '@/store/modules/drawing.store'
import useFeaturesStore from '@/store/modules/features.store'
import type { ActionDispatcher } from '@/store/types'

const dispatcher: ActionDispatcher = { name: 'DrawingToolboxButton.vue' }

const { t } = useI18n()
const uiStore = useUIStore()
const drawingStore = useDrawingStore()
const featuresStore = useFeaturesStore()

const { drawingMode } = defineProps<{ drawingMode: EditableFeatureTypes }>()

const isPhoneMode = computed(() => uiStore.isPhoneMode)
const currentDrawingMode = computed(() => drawingStore.mode)
const isActive = computed(() => drawingMode === currentDrawingMode.value)
const buttonIcon = computed((): string[] => {
    switch (drawingMode) {
        case EditableFeatureTypes.LinePolygon:
            return ['fa', 'draw-polygon']
        case EditableFeatureTypes.Marker:
            return ['fa', 'map-marker-alt']
        case EditableFeatureTypes.Measure:
            return ['fa', 'ruler']
        case EditableFeatureTypes.Annotation:
            return ['fa', 't']
    }
    return ['fa', 'question']
})

function setDrawingMode() {
    if (isActive.value) {
        drawingStore.setDrawingMode(undefined, dispatcher)
    } else {
        featuresStore.clearAllSelectedFeatures(dispatcher)
        drawingStore.setDrawingMode(drawingMode, dispatcher)
    }
}
</script>

<template>
    <button
        class="drawing-mode-button btn"
        :class="{
            'btn-primary': isActive,
            'btn-light': !isActive,
            'btn-lg py-3': !isPhoneMode,
        }"
        @click="setDrawingMode"
    >
        <FontAwesomeIcon :icon="buttonIcon" />
        <small
            v-if="!isPhoneMode"
            class="d-sm-block"
        >
            {{ t(`draw_${drawingMode.toLowerCase()}`) }}
        </small>
    </button>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@include respond-above(phone) {
    .drawing-mode-button {
        min-width: 7rem;
    }
}
</style>
