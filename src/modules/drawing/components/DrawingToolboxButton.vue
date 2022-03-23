<template>
    <ButtonWithIcon
        small
        outline-light
        :button-title="buttonLabel"
        :danger="isActive"
        :button-font-awesome-icon="buttonIcon"
        :icons-before-text="true"
        direction="column"
        :class="buttonClasses"
        :data-cy="`drawing-${drawingMode.toLowerCase()}`"
        @click="emitSetDrawingMode"
    />
</template>

<script>
import { DrawingModes } from '@/modules/store/modules/drawing.store'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { UIModes } from '@/modules/store/modules/ui.store'

export default {
    components: { ButtonWithIcon },
    props: {
        drawingMode: {
            type: String,
            default: DrawingModes.LINEPOLYGON,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        uiMode: {
            type: String,
            default: UIModes.MENU_ALWAYS_OPEN,
        },
    },
    emits: ['setDrawingMode'],
    computed: {
        buttonIcon() {
            switch (this.drawingMode) {
                case DrawingModes.LINEPOLYGON:
                    return ['fa', 'draw-polygon']
                case DrawingModes.MARKER:
                    return ['fa', 'map-marker-alt']
                case DrawingModes.MEASURE:
                    return ['fa', 'ruler']
                case DrawingModes.ANNOTATION:
                    return ['fa', 't']
            }
            return null
        },
        buttonLabel() {
            // Don't show a label on small viewports.
            if (this.uiMode === UIModes.MENU_ALWAYS_OPEN) {
                return this.$t(`draw_${this.drawingMode.toLowerCase()}`)
            } else {
                return undefined
            }
        },
        buttonClasses() {
            // Set a fixed width on large viewports for a consistent look.
            if (this.uiMode === UIModes.MENU_ALWAYS_OPEN) {
                return 'button-with-icon-uniform'
            } else {
                return undefined
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

<style lang="scss" scoped>
.button-with-icon-uniform {
    width: 5em;
}
</style>
