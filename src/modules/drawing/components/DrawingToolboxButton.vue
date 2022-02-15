<template>
    <ButtonWithIcon
        large
        outline-light
        :danger="isActive"
        :button-font-awesome-icon="buttonIcon"
        :data-cy="`drawing-${drawingMode.toLowerCase()}`"
        @click="emitSetDrawingMode"
    />
</template>

<script>
import { drawingModes } from '@/modules/store/modules/drawing.store'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'

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
        buttonIcon: function () {
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
    },
    methods: {
        emitSetDrawingMode: function () {
            this.$emit('setDrawingMode', this.drawingMode)
        },
    },
}
</script>
