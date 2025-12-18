<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingStore from '@/store/modules/drawing'
import useFeaturesStore from '@/store/modules/features'
import useUIStore from '@/store/modules/ui'

const dispatcher: ActionDispatcher = { name: 'DrawingToolboxButton.vue' }

const { featureType } = defineProps<{ featureType: EditableFeatureTypes }>()

const { t } = useI18n()
const uiStore = useUIStore()
const drawingStore = useDrawingStore()
const featuresStore = useFeaturesStore()

const isActive = computed<boolean>(() => featureType === drawingStore.edit.featureType)
const buttonIcon = computed<string[]>(() => {
    switch (featureType) {
        case EditableFeatureTypes.LinePolygon:
            return ['fa', 'draw-polygon']
        case EditableFeatureTypes.Marker:
            return ['fa', 'map-marker-alt']
        case EditableFeatureTypes.Measure:
            return ['fa', 'ruler']
        case EditableFeatureTypes.Annotation:
            return ['fa', 't']
        default:
            return []
    }
})

function setDrawingMode() {
    if (isActive.value) {
        drawingStore.setDrawingMode(undefined, dispatcher)
    } else {
        featuresStore.clearAllSelectedFeatures(dispatcher)
        drawingStore.setDrawingMode(featureType, dispatcher)
    }
}
</script>

<template>
    <button
        class="drawing-mode-button btn"
        :class="{
            'btn-primary': isActive,
            'btn-light': !isActive,
            'btn-lg py-3': !uiStore.isPhoneMode,
        }"
        @click="setDrawingMode"
    >
        <FontAwesomeIcon :icon="buttonIcon" />
        <small
            v-if="!uiStore.isPhoneMode"
            class="d-sm-block"
        >
            {{ t(`draw_${featureType.toLowerCase()}`) }}
        </small>
    </button>
</template>

<style lang="scss" scoped>
@import '@swissgeo/theme/scss/media-query.mixin';
@include respond-above(phone) {
    .drawing-mode-button {
        min-width: 7rem;
    }
}
</style>
