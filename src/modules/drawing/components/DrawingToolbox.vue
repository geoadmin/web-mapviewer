<template>
    <portal to="modal-container">
        <div class="drawing-toolbox">
            <div class="card">
                <div class="card-body">
                    <button class="btn-close btn btn-default" @click="emitCloseEvent">
                        <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                    <DrawingToolboxButton
                        v-for="drawingMode in drawingModes"
                        :key="drawingMode"
                        :drawing-mode="drawingMode"
                        :is-active="currentDrawingMode === drawingMode"
                        @setDrawingMode="bubbleSetDrawingEventToParent"
                    />
                </div>
            </div>
        </div>
    </portal>
</template>

<script>
import { mapState, mapActions } from 'vuex' // todo remove
import DrawingToolboxButton from '@/modules/drawing/components/DrawingToolboxButton'
import geojson from 'geojson' // todo remove

export default {
    components: { DrawingToolboxButton },
    props: {
        drawingModes: {
            type: Array,
            required: true,
        },
        currentDrawingMode: {
            type: String,
            default: null,
        },
    },
    data: function () {
        // todo remove
        return {
            coordinates: [],
        }
    },
    computed: {
        // todo remove
        ...mapState({
            coordinate: (state) => (state.map.clickInfo ? state.map.clickInfo.coordinate : null),
        }),
    },
    watch: {
        // todo remove
        coordinate: function (coord) {
            console.log(this.currentDrawingMode)
            if (this.currentDrawingMode === 'MARKER') {
                const data = [{ type: this.currentDrawingMode, coords: [...coord] }]
                this.setDrawingGeoJSON(geojson.parse(data, { Point: 'coords' }))
                this.setDrawingMode(null)
            }
        },
    },
    methods: {
        ...mapActions(['setDrawingMode', 'setDrawingGeoJSON']), // todo remove
        emitCloseEvent: function () {
            this.$emit('close')
        },
        bubbleSetDrawingEventToParent: function (drawingMode) {
            this.$emit('setDrawingMode', drawingMode)
        },
    },
}
</script>

<style lang="scss">
.drawing-toolbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;

    .btn-close {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
    }
}
</style>
