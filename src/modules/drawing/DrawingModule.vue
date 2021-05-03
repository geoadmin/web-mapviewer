<template>
    <div>
        <div v-if="show" class="draw-overlay">
            <DrawingToolbox
                :drawing-modes="drawingModes"
                :current-drawing-mode="currentDrawingMode"
                @close="hideDrawingOverlay"
                @setDrawingMode="changeDrawingMode"
            />
        </div>
        <div v-show="show">
            <drawing-style-popup
                ref="overlay"
                :feature="selectedFeature"
                @delete="deleteSelectedFeature"
                @close="deactivateFeature"
            />
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { drawingModes } from '@/modules/store/modules/drawing.store'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox'
import DrawingManager from '@/modules/drawing/lib/DrawingManager'
import { createEditingStyle } from '@/modules/drawing/lib/style'
import DrawingStylePopup from './components/DrawingStylePopup.vue'
import { Overlay } from 'ol'

const overlay = new Overlay({})

export default {
    components: { DrawingToolbox, DrawingStylePopup },
    inject: ['getMap'],
    computed: {
        ...mapState({
            show: (state) => state.ui.showDrawingOverlay,
            currentDrawingMode: (state) => state.drawing.mode,
            geoJson: (state) => state.drawing.geoJson,
            selectedFeature: function (state) {
                const sfd = state.drawing.selectedFeatureData
                const geoJson = state.drawing.geoJson
                let f = null
                if (sfd) {
                    f = geoJson.features.find((f) => f.id === sfd.featureId)
                }
                overlay.setVisible(!!f)
                if (!f) {
                    return null
                }
                const xy = f.coordinate || [731667.39, 5862995.8]
                overlay.setPosition(xy)
                return f
            },
        }),
        drawingModes: function () {
            const modes = []
            Object.keys(drawingModes).forEach((key) => modes.push(key))
            return modes
        },
    },
    mounted() {
        /** @type {import('ol/Map').default} */
        const map = this.getMap()
        overlay.setElement(this.$refs['overlay'].$el)
        map.addOverlay(overlay)
        this.manager = new DrawingManager(
            map,
            {
                [drawingModes.LINE]: {
                    drawOptions: {
                        type: 'Polygon',
                        minPoints: 2,
                    },
                    properties: {
                        color: '#f00',
                        description: '',
                    },
                },
                [drawingModes.MARKER]: {
                    drawOptions: {
                        type: 'Point',
                    },
                    properties: {
                        color: '#f00',
                        font: 'normal 16px Helvetica',
                        icon: 'https://api3.geo.admin.ch/color/255,0,0/marker-24@2x.png',
                        anchor: [0.5, 0.9],
                        text: '',
                        description: '',
                    },
                },
                [drawingModes.MEASURE]: {
                    drawOptions: {
                        type: 'Polygon',
                        minPoints: 2,
                    },
                    properties: {
                        color: '#f00',
                    },
                },
                [drawingModes.TEXT]: {
                    drawOptions: {
                        type: 'Point',
                    },
                    properties: {
                        color: '#f00',
                        text: 'new text',
                        font: 'normal 16px Helvetica',
                    },
                },
            },
            {
                editingStyle: createEditingStyle(),
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
        ...mapActions([
            'toggleDrawingOverlay',
            'setDrawingMode',
            'setDrawingGeoJSON',
            'setDrawingSelectedFeatureData',
        ]),
        hideDrawingOverlay: function () {
            this.setDrawingMode(null)
            this.toggleDrawingOverlay()
        },
        changeDrawingMode: function (mode) {
            this.setDrawingMode(mode)

            // FIXME: wrong place
            this.manager.toggleTool(mode)
        },
        deleteSelectedFeature: function (id) {
            const newFeatures = this.geoJson.features.filter((f) => f.id !== id)
            const newGeojJson = Object.assign({}, this.geoJson, {
                features: newFeatures,
            })
            this.setDrawingGeoJSON(newGeojJson)
        },
        deactivateFeature: function () {
            this.setDrawingSelectedFeatureData(null)
        },
    },
}
</script>

<style lang="scss">
.draw-overlay {
}
</style>
