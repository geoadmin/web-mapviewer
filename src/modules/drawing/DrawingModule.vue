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
                @updateProperties="updateProperties"
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
import { create, update } from '@/api/files.api'

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
            kmlIds: (state) => state.drawing.drawingKmlIds,
        }),
        drawingModes: function () {
            const modes = []
            Object.keys(drawingModes).forEach((key) => modes.push(key))
            return modes
        },
    },
    watch: {
        show: function (show) {
            if (show) {
                this.manager.activate()
            } else {
                this.manager.deactivate()
            }
        },
        currentDrawingMode: function (mode) {
            this.manager.toggleTool(mode)
        },
        geoJson: function (geoJson) {
            this.manager.updateFeatures(geoJson)
        },
    },
    destroyed() {
        document.body['drawingMap'] = undefined
    },
    mounted() {
        /** @type {import('ol/Map').default} */
        const map = this.getMap()
        document.body['drawingMap'] = map
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
        this.manager.on('change', (event) => {
            this.setDrawingGeoJSON(event.geojson)
            this.saveDrawing(event.kml)
        })
        this.manager.on('select', (event) => {
            this.setDrawingSelectedFeatureData({
                featureId: event.featureId,
                featureType: event.featureType,
                coordinates: event.coordinates,
                modifying: event.modifying,
            })
        })
    },
    methods: {
        ...mapActions([
            'toggleDrawingOverlay',
            'setDrawingMode',
            'setDrawingGeoJSON',
            'setDrawingSelectedFeatureData',
            'setKmlIds',
        ]),
        hideDrawingOverlay: function () {
            this.setDrawingMode(null)
            this.toggleDrawingOverlay()
        },
        changeDrawingMode: function (mode) {
            this.setDrawingMode(mode)
        },
        deleteSelectedFeature: function (id) {
            const newFeatures = this.geoJson.features.filter((f) => f.id !== id)
            const newGeoJson = Object.assign({}, this.geoJson, {
                features: newFeatures,
            })
            this.setDrawingGeoJSON(newGeoJson)
        },
        deactivateFeature: function () {
            this.setDrawingSelectedFeatureData(null)
        },
        updateProperties: function (featureId, properties) {
            const idx = this.geoJson.features.findIndex((f) => f.id === featureId)
            const newGeoJson = Object.assign({}, this.geoJson)
            const newFeature = Object.assign({}, newGeoJson.features[idx], {
                properties,
            })
            newGeoJson.features[idx] = newFeature
            this.setDrawingGeoJSON(newGeoJson)
        },
        saveDrawing: async function (kml) {
            let ids
            if (!this.kmlIds) {
                ids = await create(kml)
            } else {
                ids = await update(this.kmlIds.adminId, kml)
            }
            if (ids && ids.adminId && ids.fileId) {
                this.setKmlIds({ adminId: ids.adminId, fileId: ids.fileId })
            }
        },
    },
}
</script>

<style lang="scss"></style>
