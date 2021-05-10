<template>
    <button
        class="btn btn-lg button-drawing"
        :class="{
            'btn-danger': isActive,
            'btn-outline-light text-dark': !isActive,
        }"
        :data-cy="`drawing-${drawingMode.toLowerCase()}`"
        @click="emitSetDrawingMode"
    >
        <font-awesome-icon :icon="buttonIcon" />
    </button>
</template>

<script>
import { drawingModes } from '@/modules/store/modules/drawing.store'

export default {
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

<style>
.button-drawing {
    margin: 0 0.1rem;
}
</style>
