<script setup lang="js">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { EditableFeatureTypes } from '@/api/features.api'

const dispatcher = { dispatcher: 'DrawingToolboxButton.vue' }

const { t } = useI18n()
const store = useStore()

const { drawingMode } = defineProps({
    drawingMode: {
        type: String,
        default: EditableFeatureTypes.LinePolygon,
    },
})

const isPhoneMode = computed(() => store.getters.isPhoneMode)
const currentDrawingMode = computed(() => store.state.drawing.mode)
const isActive = computed(() => drawingMode === currentDrawingMode.value)
const buttonIcon = computed(() => {
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
    return null
})

function setDrawingMode() {
    if (isActive.value) {
        store.dispatch('setDrawingMode', { mode: null, ...dispatcher })
    } else {
        store.dispatch('clearAllSelectedFeatures', dispatcher)
        store.dispatch('setDrawingMode', { mode: drawingMode, ...dispatcher })
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
