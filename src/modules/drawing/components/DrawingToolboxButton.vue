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
                    // TODO: Redo a T+ logo somehow (T text sign is only included in pro version)
                    // so either go pro, and stack icons to achieve this or go the old way :
                    // it was injected as a custom FA icon in the old viewer
                    return ['fa', 'plus']
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
