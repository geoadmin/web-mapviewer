<script setup lang="ts">
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed } from 'vue'

import type { EditableFeature } from '@/api/features.api'
import { type DrawingIcon, type DrawingIconSet, generateIconURL } from '@/api/icon.api'
import type { FeatureStyleColor } from '@/utils/featureStyleUtils'

const { icon, currentFeature, currentIconSet, tooltipDisabled, currentLang } = defineProps<{
    icon: DrawingIcon
    currentFeature: EditableFeature
    currentIconSet: DrawingIconSet
    /** Tooltip will be disabled when the symbol selector is collapsed */
    tooltipDisabled?: boolean
    currentLang: string
}>()

const emits = defineEmits<{
    change: []
    changeIcon: [icon: DrawingIcon]
    load: []
}>()

const isTooltipDisabled = computed(() => !icon.description || tooltipDisabled)

const isTextSameLanguage = (langKey: string) => langKey === currentLang

function onCurrentIconChange(icon: DrawingIcon) {
    emits('changeIcon', icon)
    emits('change')
}

/**
 * Generate an icon URL with medium size (so that the size doesn't change in the icon selector, even
 * when the user selects a different size for the icon the map)
 */
function generateColorizedURL(icon: DrawingIcon): string {
    return generateIconURL(icon, currentFeature.fillColor)
}

function getImageStrokeStyle(isColorable: boolean, isSelected: boolean, color?: FeatureStyleColor) {
    if (isColorable && color) {
        return {
            filter: `drop-shadow(1px 1px 0 ${color.border}) drop-shadow(-1px -1px 0 ${color.border})`,
        }
    } else if (isSelected) {
        return { filter: 'drop-shadow(0px 0px 0 white)' }
    }
}

function onImageLoad() {
    emits('load')
}
</script>

<template>
    <GeoadminTooltip
        :disabled="isTooltipDisabled"
        use-default-padding
    >
        <button
            ref="iconButton"
            class="icon-description btn btn-sm"
            :class="{
                'btn-light': currentFeature.icon?.name !== icon.name,
                'btn-primary': currentFeature.icon?.name === icon.name,
            }"
            :data-cy="`drawing-style-icon-selector-${icon.name}`"
            @click="onCurrentIconChange(icon)"
        >
            <img
                :alt="icon.name"
                :src="generateColorizedURL(icon)"
                class="marker-icon-image"
                :style="
                    getImageStrokeStyle(
                        currentIconSet.isColorable,
                        currentFeature.icon?.name === icon.name,
                        currentFeature.fillColor
                    )
                "
                crossorigin="anonymous"
                @load="onImageLoad"
            />
        </button>
        <template #content>
            <div
                v-for="(text, key) in icon.description"
                :key="key"
            >
                <strong v-if="isTextSameLanguage(key)">{{ text }}</strong>
                <template v-else> {{ text }}</template>
            </div>
        </template>
    </GeoadminTooltip>
</template>

<style lang="scss" scoped>
.marker-icon-image {
    width: 2rem;
    height: 2rem;
}
button {
    --bs-btn-padding-x: 0.25rem;
}
</style>
