<template>
    <div
        class="color-select-box bg-light border-light"
        :class="{ inline: inline }"
        data-cy="drawing-style-color-select-box"
    >
        <div
            v-for="color in colors"
            :key="color.name"
            :data-cy="`color-selector-${color.name}`"
            @click="() => onColorChange(color)"
        >
            <div class="color-circle" :style="colorCircleStyle(color)"></div>
        </div>
    </div>
</template>

<script>
import { drawingStyleColors } from '@/modules/drawing/lib/drawingStyleColor'

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
    },
    emits: ['change'],
    data() {
        return {
            colors: drawingStyleColors,
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
    border-radius: 2px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    &.inline {
        display: flex;
        justify-content: space-evenly;
    }
    .color-circle {
        width: 2rem;
        height: 2rem;
        border-radius: 1rem;
        border: 1px solid black;
        cursor: pointer;
    }
}
</style>
