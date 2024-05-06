<template>
    <div>
        <label for="drawing-style-text-color-selector" class="form-label">
            {{ $t('modify_text_color_label') }}
        </label>
        <div id="drawing-style-text-color-selector" class="rounded bg-light">
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
@import '@/scss/webmapviewer-bootstrap-theme';

#drawing-style-text-color-selector {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
}
</style>
