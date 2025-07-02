<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import {
    allStylingColors,
    FeatureStyleColor, generateFontString,
    generateTextShadow,
    MEDIUM,
} from '@/utils/featureStyleUtils'

const { currentColor } = defineProps<{
    currentColor: FeatureStyleColor
}>()

const emits = defineEmits<{
    change: [color: FeatureStyleColor]
}>()

const { t } = useI18n()

function onColorChange(color: FeatureStyleColor) {
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
        <div class="tw:grid tw:grid-cols-4 bg-light tw:rounded">
            <button
                v-for="color in allStylingColors"
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
