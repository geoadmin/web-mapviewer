<template>
    <div>
        <label for="drawing-style-text-color-selector" class="form-label">
            {{ $t('modify_text_color_label') }}
        </label>
        <div id="drawing-style-text-color-selector" class="btn-group bg-light border-light">
            <button
                v-for="color in colors"
                :key="color.name"
                class="btn btn-sm"
                :class="{
                    'btn-light': currentColor !== color.fill,
                    'btn-primary': currentColor === color.fill,
                }"
                :style="{
                    color: color.name,
                    font: currentFont,
                    'text-shadow': color.textShadow,
                }"
                @click="onColorChange(color)"
            >
                Aa
            </button>
        </div>
    </div>
</template>
<script>
import { drawingStyleColors } from '@/modules/drawing/components/styling/drawingStyleColor'

export default {
    props: {
        feature: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            colors: drawingStyleColors,
            currentColor: this.feature.get('color'),
        }
    },
    computed: {
        currentFont: function () {
            if (!this.feature) {
                return null
            }
            return this.feature.get('font')
        },
    },
    methods: {
        onColorChange: function (color) {
            this.feature.set('color', color.fill)
            this.currentColor = color.fill
            this.feature.set('strokeColor', color.border)
        },
    },
}
</script>
