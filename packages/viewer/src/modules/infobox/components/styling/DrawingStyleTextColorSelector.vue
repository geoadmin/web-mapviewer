<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import {
    allStylingColors,
    type FeatureStyleColor,
    generateFontString,
    generateTextShadow,
    MEDIUM,
} from '@/utils/featureStyleUtils'

const { currentColor } = defineProps<{
    currentColor: FeatureStyleColor
}>()

const emits = defineEmits<{
    change: [color: FeatureStyleColor]
}>()

const colors = ref<FeatureStyleColor[]>(allStylingColors)

const { t } = useI18n()

function onColorChange(color: FeatureStyleColor): void {
    emits('change', color)
}
</script>

<template>
    <div>
        <label
            for="drawing-style-text-color-selector"
            class="form-label"
        >
            {{ t('modify_text_color_label') }}
        </label>
        <div
            id="drawing-style-text-color-selector"
            class="rounded bg-light"
        >
            <button
                v-for="color in colors"
                :key="color.name"
                class="btn btn-sm m-1"
                :class="{
                    'btn-light': currentColor.name !== color.name,
                    'btn-primary': currentColor.name === color.name,
                }"
                :style="{
                    color: color.name,
                    font: generateFontString(MEDIUM),
                    'text-shadow': generateTextShadow(color),
                }"
                :data-cy="`drawing-style-text-color-${color.name}`"
                @click="onColorChange(color)"
            >
                Aa
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

#drawing-style-text-color-selector {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
}
</style>
