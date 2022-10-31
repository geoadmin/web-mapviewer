<template>
    <div class="color-select-box" data-cy="drawing-style-color-select-box">
        <button
            v-for="color in colors"
            :key="color.name"
            :data-cy="`color-selector-${color.name}`"
            :class="{
                'btn-light': currentColor.name !== color.name,
                'btn-primary': currentColor.name === color.name,
            }"
            class="btn"
            @click="() => onColorChange(color)"
        >
            <div class="color-circle" :style="colorCircleStyle(color)"></div>
        </button>
    </div>
</template>

<script>
import { allStylingColors, FeatureStyleColor } from '@/utils/featureStyleUtils'

/**
 * Component showing all available color for a feature and making it possible to switch from one
 * color to the other (will be responsible to change the color of the feature)
 */
export default {
    props: {
        inline: {
            type: Boolean,
            default: false,
        },
        currentColor: {
            type: FeatureStyleColor,
            required: true,
        },
    },
    emits: ['change'],
    data() {
        return {
            colors: allStylingColors,
        }
    },
    methods: {
        onColorChange(color) {
            this.$emit('change', color)
        },
        colorCircleStyle(color) {
            return {
                'background-color': color.name,
                'border-color': color.border,
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.color-select-box {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    background-color: $gainsboro;
    border-radius: 0.375rem;

    button {
        display: inline-flex;
        justify-content: center;

        margin-left: $drawing-options-button-margin;
        margin-right: $drawing-options-button-margin;
        margin-top: $drawing-options-button-margin;
        margin-bottom: $drawing-options-button-margin;
    }

    .color-circle {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 1rem;
        border: 1px solid black;
    }
}
</style>
