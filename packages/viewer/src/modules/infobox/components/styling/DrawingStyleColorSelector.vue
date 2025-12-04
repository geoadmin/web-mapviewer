<script setup lang="ts">
/**
 * Component showing all available color for a feature and making it possible to switch from one
 * color to the other (will be responsible to change the color of the feature)
 */

import { ref } from 'vue'

import type { FeatureStyleColor } from '@/utils/featureStyle/types'

import { allStylingColors } from '@/utils/featureStyle'

const { inline, currentColor } = defineProps<{
    inline?: boolean
    currentColor?: FeatureStyleColor
}>()

const emits = defineEmits<{
    change: [color: FeatureStyleColor]
}>()

const colors = ref<FeatureStyleColor[]>(allStylingColors)

function onColorChange(color: FeatureStyleColor): void {
    emits('change', color)
}

function colorCircleStyle(color: FeatureStyleColor): Record<string, string> {
    return {
        'background-color': color.name,
        'border-color': color.border,
    }
}
</script>

<template>
    <div
        class="color-select-box bg-light rounded"
        data-cy="drawing-style-color-select-box"
        :class="{ inline: inline }"
    >
        <button
            v-for="color in colors"
            :key="color.name"
            :data-cy="`color-selector-${color.name}`"
            :class="{
                'btn-light': currentColor?.name !== color.name,
                'btn-primary': currentColor?.name === color.name,
            }"
            class="btn"
            @click="() => onColorChange(color)"
        >
            <span
                class="color-circle rounded-circle"
                :style="colorCircleStyle(color)"
            />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.color-select-box button {
    display: inline-flex;
    justify-content: center;
}

.color-select-box {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;

    &.inline {
        display: flex;
        justify-content: space-evenly;

        button {
            padding-left: 0.25rem;
            padding-right: 0.25rem;
        }
    }

    .color-circle {
        width: 1.25rem;
        height: 1.25rem;
        border: 1px solid black;
    }
}
</style>
