<script setup lang="ts">
import type { DrawingIcon, DrawingIconSet, FeatureStyleColor } from '@swissgeo/api'

import { iconsAPI } from '@swissgeo/api'
import { featureStyleUtils } from '@swissgeo/api/utils'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed } from 'vue'

import useDrawingStore from '@/store/modules/drawing'
import useI18nStore from '@/store/modules/i18n'

const { icon, currentIconSet, tooltipDisabled } = defineProps<{
    icon: DrawingIcon
    currentIconSet: DrawingIconSet
    /** Tooltip will be disabled when the symbol selector is collapsed */
    tooltipDisabled?: boolean
}>()

const emits = defineEmits<{
    change: [void]
    changeIcon: [icon: DrawingIcon]
    load: [void]
}>()

const drawingStore = useDrawingStore()
const i18nStore = useI18nStore()

const isTooltipDisabled = computed<boolean>(() => !icon.description || tooltipDisabled)
const iconPreviewColor = computed<FeatureStyleColor>(
    () =>
        drawingStore.edit.preferred.color ??
        drawingStore.feature.current?.fillColor ??
        featureStyleUtils.RED
)

const isTextSameLanguage = (langKey: string): boolean => langKey === i18nStore.lang

function onCurrentIconChange(icon: DrawingIcon): void {
    emits('changeIcon', icon)
    emits('change')
}

/**
 * Generate an icon URL with medium size (so that the size doesn't change in the icon selector, even
 * when the user selects a different size for the icon the map)
 */
function generateColorizedURL(icon: DrawingIcon): string {
    return iconsAPI.generateIconURL(icon, iconPreviewColor.value.fill)
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
        v-if="drawingStore.feature.current"
        :disabled="isTooltipDisabled"
        use-default-padding
    >
        <button
            ref="iconButton"
            class="icon-description btn btn-sm"
            :class="{
                'btn-light': drawingStore.feature.current.icon?.name !== icon.name,
                'btn-primary': drawingStore.feature.current.icon?.name === icon.name,
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
                        drawingStore.feature.current.icon?.name === icon.name,
                        iconPreviewColor
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
