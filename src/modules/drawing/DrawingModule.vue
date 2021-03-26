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
import geojson from 'geojson'

export default {
    components: { DrawingToolbox },
    data: function () {
        return {
            coordinates: [],
        }
    },
    computed: {
        ...mapState({
            show: (state) => state.ui.showDrawingOverlay,
            currentDrawingMode: (state) => state.drawing.mode,
            coordinate: (state) => (state.map.clickInfo ? state.map.clickInfo.coordinate : null),
            dbclick: (state) => (state.map.clickInfo ? state.map.clickInfo.doubleClick : false),
        }),
        drawingModes: function () {
            const modes = []
            Object.keys(drawingModes).forEach((key) => modes.push(key))
            return modes
        },
    },
    watch: {
        coordinate: function (coord) {
            if (
                this.currentDrawingMode === drawingModes.MARKER ||
                this.currentDrawingMode === drawingModes.TEXT
            ) {
                const data = [{ type: this.currentDrawingMode, coords: [...coord] }]
                this.setDrawingGeoJSON(geojson.parse(data, { Point: 'coords' }))
                this.setDrawingMode(null)
            } else if (
                this.currentDrawingMode === drawingModes.LINE ||
                this.currentDrawingMode === drawingModes.MEASURE
            ) {
                this.coordinates.push([...coord])
            }
        },
        dbclick: function (dbclick) {
            if (
                dbclick &&
                (this.currentDrawingMode === drawingModes.LINE ||
                    this.currentDrawingMode === drawingModes.MEASURE)
            ) {
                const data = [{ type: this.currentDrawingMode, coords: [...this.coordinates] }]
                this.setDrawingGeoJSON(geojson.parse(data, { LineString: 'coords' }))
                this.setDrawingMode(null)
                this.coordinates = []
            }
        },
    },
    methods: {
        ...mapActions(['toggleDrawingOverlay', 'setDrawingMode', 'setDrawingGeoJSON']),
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