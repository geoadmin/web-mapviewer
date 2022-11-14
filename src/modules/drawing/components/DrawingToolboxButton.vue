<template>
    <ButtonWithIcon
        small
        :button-title="buttonLabel"
        :primary="isActive"
        :button-font-awesome-icon="buttonIcon"
        :icons-before-text="true"
        direction="column"
        :class="[{ 'drawing-toolbox-button-active': isActive }, 'drawing-toolbox-button']"
        :data-cy="`drawing-${drawingMode.toLowerCase()}`"
        @click="emitSetDrawingMode"
    />
</template>

<script>
import { EditableFeatureTypes } from '@/api/features.api'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { mapGetters } from 'vuex'

export default {
    components: { ButtonWithIcon },
    props: {
        drawingMode: {
            type: String,
            default: EditableFeatureTypes.LINEPOLYGON,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['setDrawingMode'],
    computed: {
        ...mapGetters(['isPhoneMode']),
        buttonIcon() {
            switch (this.drawingMode) {
                case EditableFeatureTypes.LINEPOLYGON:
                    return ['fa', 'draw-polygon']
                case EditableFeatureTypes.MARKER:
                    return ['fa', 'map-marker-alt']
                case EditableFeatureTypes.MEASURE:
                    return ['fa', 'ruler']
                case EditableFeatureTypes.ANNOTATION:
                    return ['fa', 't']
            }
            return null
        },
        buttonLabel() {
            // Don't show a label on small viewports.
            if (this.isPhoneMode) {
                return undefined
            } else {
                return this.$t(`draw_${this.drawingMode.toLowerCase()}`)
            }
        },
    },
    methods: {
        emitSetDrawingMode() {
            this.$emit('setDrawingMode', this.drawingMode)
        },
    },
}
</script>

<style lang="scss">
@import 'src/scss/media-query.mixin';
@import 'src/scss/webmapviewer-bootstrap-theme';

.drawing-toolbox-button {
    border-width: 2px;
    border-radius: 15px;
    border-color: rgb(238, 238, 238);
    padding: 1rem 0;
}
.drawing-toolbox-button-active {
    border-radius: 4px;
    color: white !important;
}

@include respond-above(phone) {
    .drawing-toolbox-button {
        padding: 0.5rem 0;
    }
}
@include respond-above(tablet) {
    .drawing-toolbox-button {
        font-weight: bold;

        & > .icon {
            font-weight: normal;
            font-size: 1.6rem;
        }
    }
}
</style>
