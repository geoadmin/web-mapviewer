<template>
    <ButtonWithIcon
        small
        outline-light
        :button-title="drawingModeToLabel(drawingMode)"
        :danger="isActive"
        :button-font-awesome-icon="buttonIcon"
        :icons-before-text="true"
        direction="column"
        :style="buttonStyle"
        :data-cy="`drawing-${drawingMode.toLowerCase()}`"
        @click="emitSetDrawingMode"
    />
</template>

<script>
import { mapState } from 'vuex'
import { drawingModes } from '@/modules/store/modules/drawing.store'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { UIModes } from '@/modules/store/modules/ui.store'

export default {
    components: { ButtonWithIcon },
    props: {
        drawingMode: {
            type: String,
            default: drawingModes.LINE,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['setDrawingMode'],
    computed: {
        ...mapState({
            uiMode: (state) => state.ui.mode,
        }),
        buttonIcon() {
            switch (this.drawingMode) {
                case drawingModes.LINE:
                    return ['fa', 'draw-polygon']
                case drawingModes.MARKER:
                    return ['fa', 'map-marker-alt']
                case drawingModes.MEASURE:
                    return ['fa', 'ruler']
                case drawingModes.TEXT:
                    return ['fa', 't']
            }
            return null
        },
        buttonStyle() {
            return {
                // The buttons having different/dynamic widths looks unintentional.
                // While inline styles are bad, there is no Bootstrap class we can
                // apply to the component and this width is too use-case specific
                // to be added as a class in the ButtonWithIcon component.
                width: this.uiMode === 'MENU_ALWAYS_OPEN' ? '4.5em' : '',
            }
        },
    },
    methods: {
        drawingModeToLabel(mode) {
            // Don't show a label on small viewports.
            if (this.uiMode === UIModes.MENU_ALWAYS_OPEN) {
                return this.$t(`draw_${mode.toLowerCase()}`)
            }
        },
        emitSetDrawingMode() {
            this.$emit('setDrawingMode', this.drawingMode)
        },
    },
}
</script>
