<template>
    <div v-if="show" class="draw-overlay">
        <DrawingToolbox
            :drawing-modes="drawingModes"
            :current-drawing-mode="currentDrawingMode"
            @close="hideDrawingOverlay"
            @setDrawingMode="changeDrawingMode"
        />
    </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { drawingModes } from '@/modules/store/modules/drawing.store'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox'
export default {
    components: { DrawingToolbox },
    computed: {
        ...mapState({
            show: (state) => state.ui.showDrawingOverlay,
            currentDrawingMode: (state) => state.drawing.mode,
        }),
        drawingModes: function () {
            const modes = []
            Object.keys(drawingModes).forEach((key) => modes.push(key))
            return modes
        },
    },
    methods: {
        ...mapActions(['toggleDrawingOverlay', 'setDrawingMode']),
        hideDrawingOverlay: function () {
            this.setDrawingMode(null)
            this.toggleDrawingOverlay()
        },
        changeDrawingMode: function (mode) {
            this.setDrawingMode(mode)
        },
    },
}
</script>
<style lang="scss">
.draw-overlay {
}
</style>
