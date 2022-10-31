<template>
    <div class="color-select-box bg-light border-light" data-cy="drawing-style-color-select-box">
        <ButtonWithIcon
            v-for="color in colors"
            :key="color.name"
            :data-cy="`color-selector-${color.name}`"
            :button-font-awesome-icon="['fas', 'circle']"
            :style="{ color: color.name }"
            :primary="currentColor.name === color.name"
            :class="{ 'button-background': currentColor.name !== color.name }"
            direction="column"
            icon-size="lg"
            @click="() => onColorChange(color)"
        ></ButtonWithIcon>
    </div>
</template>

<script>
import { allStylingColors, FeatureStyleColor } from '@/utils/featureStyleUtils'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'

/**
 * Component showing all available color for a feature and making it possible to switch from one
 * color to the other (will be responsible to change the color of the feature)
 */
export default {
    components: { ButtonWithIcon },
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
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.color-select-box {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;

    button {
        margin-left: $drawing-options-button-margin;
        margin-right: $drawing-options-button-margin;
        margin-bottom: $drawing-options-button-margin;
    }

    .button-background {
        background-color: $gainsboro;
    }
}
</style>
