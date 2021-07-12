<template>
    <div>
        <div v-if="show" class="draw-overlay">
            <DrawingToolbox
                :drawing-modes="drawingModes"
                :current-drawing-mode="currentDrawingMode"
                :export-enabled="exportEnabled"
                @close="hideDrawingOverlay"
                @setDrawingMode="changeDrawingMode"
                @export="exportDrawing"
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
        <div ref="draw-help" class="draw-help-popup"></div>
        <ProfilePopup
            :feature="selectedFeature"
            @delete="deleteSelectedFeature"
            @close="deactivateFeature"
        />
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { API_SERVICE_ICON_BASE_URL } from '@/config'
import { drawingModes } from '@/modules/store/modules/drawing.store'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox'
import DrawingManager from '@/modules/drawing/lib/DrawingManager'
import { createEditingStyle, drawLineStyle, drawMeasureStyle } from '@/modules/drawing/lib/style'
import DrawingStylePopup from './components/DrawingStylePopup.vue'
import { Overlay } from 'ol'
import { create, update } from '@/api/files.api'
import OverlayPositioning from 'ol/OverlayPositioning'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { Point } from 'ol/geom'
import ProfilePopup from '@/modules/drawing/components/ProfilePopup'
import { saveAs } from 'file-saver'

const overlay = new Overlay({
    offset: [0, 15],
    positioning: OverlayPositioning.TOP_CENTER,
    className: 'drawing-style-overlay',
})

export default {
    components: { DrawingToolbox, DrawingStylePopup, ProfilePopup },
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
        exportEnabled: function () {
            return this.manager.source && this.manager.source.getFeatures().length > 0
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
                        style: drawLineStyle,
                    },
                    properties: {
                        color: '#ff0000',
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
                        icon: `${API_SERVICE_ICON_BASE_URL}v4/iconsets/default/icon/bicycle-255,0,0.png`,
                        iconTemplate: `${API_SERVICE_ICON_BASE_URL}v4/iconsets/default/icon/bicycle-255,0,0.png`,
                        anchor: [0.5, 0.9],
                        text: '',
                        description: '',
                        textScale: 1,
                        markerScale: 1,
                        markerColor: '#ff0000',
                    },
                },
                [drawingModes.MEASURE]: {
                    drawOptions: {
                        type: 'Polygon',
                        minPoints: 2,
                        style: drawMeasureStyle,
                    },
                    properties: {
                        color: '#ff0000',
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
                helpPopupElement: this.$refs['draw-help'],
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
            const feature = selectEvent.feature
            let xy =
                feature && feature.getGeometry() instanceof Point
                    ? feature.getGeometry().getCoordinates()
                    : selectEvent.coordinates
            const showOverlay = feature && !selectEvent.modifying
            overlay.setVisible(showOverlay)
            overlay.setPosition(xy)
            this.selectedFeature = showOverlay ? feature : null
        })
    },
    methods: {
        ...mapActions(['toggleDrawingOverlay', 'setDrawingMode', 'setDrawingGeoJSON', 'setKmlIds']),
        hideDrawingOverlay: function () {
            const geojson = this.manager.createGeoJSON()
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
            this.KMLUpdateTimeout = setTimeout(
                () => {
                    const kml = this.manager.createKML()
                    if (kml && kml.length) this.saveDrawing(kml)
                },
                // when testing, speed up and avoid race conditions
                // by only waiting for next tick
                IS_TESTING_WITH_CYPRESS ? 0 : 2000
            )
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
        exportDrawing: function (gpx = false) {
            const date = new Date()
                .toISOString()
                .split('.')[0]
                .replaceAll('-', '')
                .replaceAll(':', '')
                .replace('T', '')
            let fileName = 'map.geo.admin.ch_'
            let content, type
            if (gpx) {
                fileName += `GPX_${date}.gpx`
                content = this.manager.createGPX()
                type = 'application/gpx+xml;charset=UTF-8'
            } else {
                fileName += `KML_${date}.kml`
                content = this.manager.createKML()
                type = 'application/vnd.google-earth.kml+xml;charset=UTF-8'
            }
            const blob = new Blob([content], { type: type })
            saveAs(blob, fileName)
        },
    },
}
</script>

<style lang="scss">
.tooltip-measure,
.draw-measure-tmp,
.draw-help-popup {
    background-color: rgba(140, 140, 140, 0.9);
    border-radius: 4px;
    color: white;
    padding: 2px 8px;
    font-size: 12px;
    pointer-events: none;
}

.tooltip-measure {
    background-color: rgba(255, 0, 0, 0.9);

    &:after {
        position: absolute;
        left: 50%;
        bottom: -6px;
        margin-left: -7px;
        content: '';
        border-top: 6px solid rgba(255, 0, 0, 0.9);
        border-right: 6px solid transparent;
        border-left: 6px solid transparent;
    }
}

.draw-measure-tmp {
    background-color: transparent;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;

    &:after {
        bottom: -11px;
        width: 8px;
        height: 8px;
        border-radius: 4px;
        background-color: red;
        margin-left: -4px;
        border: none;
    }
}

.cursor-grab {
    cursor: grab;
}

.cursor-grabbing {
    cursor: grabbing;
}

.cursor-pointer {
    cursor: pointer;
}
</style>