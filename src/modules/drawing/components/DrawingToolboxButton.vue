<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'

const i18n = useI18n()
const store = useStore()

const props = defineProps({
    drawingMode: {
        type: String,
        default: EditableFeatureTypes.LINEPOLYGON,
    },
})
const { drawingMode } = toRefs(props)

const isPhoneMode = computed(() => store.getters.isPhoneMode)
const currentDrawingMode = computed(() => store.state.drawing.mode)
const isActive = computed(() => drawingMode.value === currentDrawingMode.value)
const buttonIcon = computed(() => {
    switch (drawingMode.value) {
        case EditableFeatureTypes.LINEPOLYGON:
            return ['fa', 'draw-polygon']
        case EditableFeatureTypes.MARKER:
            return ['fa', 'map-marker-alt']
        case EditableFeatureTypes.MEASURE:
            return ['fa', 'ruler']
        case EditableFeatureTypes.ANNOTATION:
            return ['fa', 't']
    }
    return null
})

function setDrawingMode() {
    if (isActive.value) {
        store.dispatch('setDrawingMode', null)
    } else {
        store.dispatch('setDrawingMode', drawingMode.value)
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
        <small v-if="!isPhoneMode" class="d-sm-block">{{
            i18n.t(`draw_${drawingMode.toLowerCase()}`)
        }}</small>
    </button>
</template>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@include respond-above(phone) {
    .drawing-mode-button {
        min-width: 7rem;
    }
}
</style>
