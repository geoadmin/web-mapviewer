<template>
    <div>
        <label for="drawing-style-text-color-selector" class="form-label">
            {{ $t('modify_text_color_label') }}
        </label>
        <div id="drawing-style-text-color-selector">
            <button
                v-for="color in colors"
                :key="color.name"
                class="btn btn-sm"
                :class="{
                    'btn-light': currentColor.name !== color.name,
                    'btn-primary': currentColor.name === color.name,
                }"
                :style="{
                    color: color.name,
                    font,
                    'text-shadow': color.textShadow,
                }"
                :data-cy="`drawing-style-text-color-${color.name}`"
                @click="onColorChange(color)"
            >
                Aa
            </button>
        </div>
    </div>
</template>

<script>
import { allStylingColors, FeatureStyleColor, MEDIUM } from '@/utils/featureStyleUtils'

export default {
    props: {
        currentColor: {
            type: FeatureStyleColor,
            required: true,
        },
    },
    emits: ['change'],
    data() {
        return {
            colors: allStylingColors,
            font: MEDIUM.font,
        }
    },
    methods: {
        onColorChange(color) {
            this.$emit('change', color)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

#drawing-style-text-color-selector {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;

    button {
        margin-left: $drawing-options-button-margin;
        margin-right: $drawing-options-button-margin;
        margin-bottom: $drawing-options-button-margin;
    }
}
</style>
