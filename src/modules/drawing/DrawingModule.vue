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
import DrawingManager from '@/modules/drawing/lib/DrawingManager'
import { selectStyle } from '@/modules/drawing/lib/style'

export default {
    components: { DrawingToolbox },
    inject: ['getMap'],
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
    mounted() {
        this.manager = new DrawingManager(
            this.getMap(),
            {
                [drawingModes.LINE]: {
                    drawOptions: {
                        type: 'Polygon',
                        minPoints: 2,
                    },
                },
                [drawingModes.MARKER]: {
                    drawOptions: {
                        type: 'Point',
                    },
                },
                [drawingModes.MEASURE]: {
                    drawOptions: {
                        type: 'Polygon',
                        minPoints: 2,
                    },
                },
                [drawingModes.TEXT]: {
                    drawOptions: {
                        type: 'Point',
                    },
                },
            },
            {
                selectStyle: selectStyle,
            }
        )
        this.manager.activate()
        this.manager.on('drawstart', (event) => {
            console.log(event)
        })
        this.manager.on('drawend', (event) => {
            console.log(event)
        })
        this.manager.on('modifystart', (event) => {
            console.log(event)
        })
        this.manager.on('modifyend', (event) => {
            console.log(event)
        })
        this.manager.on('selected', (event) => {
            console.log(event)
        })
        this.manager.on('deselected', (event) => {
            console.log(event)
        })
    },
    methods: {
        ...mapActions(['toggleDrawingOverlay', 'setDrawingMode']),
        hideDrawingOverlay: function () {
            this.setDrawingMode(null)
            this.toggleDrawingOverlay()
        },
        changeDrawingMode: function (mode) {
            this.setDrawingMode(mode)

            // FIXME: wrong place
            this.manager.toggleTool(mode)
        },
    },
}
</script>

<style lang="scss">
.draw-overlay {
}
</style>
