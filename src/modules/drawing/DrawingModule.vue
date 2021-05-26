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
            <DrawingStylePopup
                ref="overlay"
                :feature="selectedFeature"
                @delete="deleteSelectedFeature"
                @close="deactivateFeature"
                @updateProperties="triggerKMLUpdate"
            />
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { API_BASE_URL } from '@/config'
import { drawingModes } from '@/modules/store/modules/drawing.store'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox'
import DrawingManager from '@/modules/drawing/lib/DrawingManager'
import { createEditingStyle } from '@/modules/drawing/lib/style'
import DrawingStylePopup from './components/DrawingStylePopup.vue'
import { Overlay } from 'ol'
import { create, update } from '@/api/files.api'
import OverlayPositioning from 'ol/OverlayPositioning'
import { IS_TESTING_WITH_CYPRESS } from '@/config'

const overlay = new Overlay({
    offset: [0, 15],
    positioning: OverlayPositioning.TOP_CENTER,
})

export default {
    components: { DrawingToolbox, DrawingStylePopup },
    inject: ['getMap'],
    data: function () {
        return {
            selectedFeature: null,
        }
    },
    computed: {
        ...mapState({
            show: (state) => state.ui.showDrawingOverlay,
            currentDrawingMode: (state) => state.drawing.mode,
            geoJson: (state) => state.drawing.geoJson,
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
                        color: '#ff0000',
                        font: 'normal 16px Helvetica',
                        icon: `${API_BASE_URL}color/255,0,0/marker-24@2x.png`,
                        anchor: [0.5, 0.9],
                        text: '',
                        description: '',
                        textScale: 1,
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
                        color: '#ff0000',
                        text: 'new text',
                        font: 'normal 16px Helvetica',
                        textScale: 1,
                    },
                },
            },
            {
                editingStyle: createEditingStyle(),
            }
        )
        // if we are testing with Cypress, we expose the map and drawing manager
        if (IS_TESTING_WITH_CYPRESS) {
            window.drawingMap = map
            window.drawingManager = this.manager
        }
        this.manager.on('change', () => {
            this.triggerKMLUpdate()
        })
        this.manager.on('select', (event) => {
            /** @type {import('./lib/DrawingManager.js').SelectEvent} */
            const selectEvent = event
            let xy = selectEvent.coordinates
            const feature = selectEvent.feature
            const showOverlay = feature && !selectEvent.modifying
            overlay.setVisible(showOverlay)
            overlay.setPosition(xy)
            this.selectedFeature = feature
        })
    },
    methods: {
        ...mapActions(['toggleDrawingOverlay', 'setDrawingMode', 'setDrawingGeoJSON', 'setKmlIds']),
        hideDrawingOverlay: function () {
            const { geojson } = this.manager.createGeoJSONAndKML()
            this.setDrawingGeoJSON(geojson)
            this.setDrawingMode(null)
            this.toggleDrawingOverlay()
        },
        changeDrawingMode: function (mode) {
            this.setDrawingMode(mode)
        },
        deleteSelectedFeature: function () {
            this.manager.deleteSelected()
        },
        deactivateFeature: function () {
            this.manager.deselect()
        },
        triggerKMLUpdate: function () {
            if (this.KMLUpdateTimeout) {
                clearTimeout(this.KMLUpdateTimeout)
                this.KMLUpdateTimeout = 0
            }
            this.KMLUpdateTimeout = setTimeout(() => {
                const { kml } = this.manager.createGeoJSONAndKML()
                this.saveDrawing(kml)
            }, 2000)
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