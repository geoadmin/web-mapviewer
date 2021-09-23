<template>
    <div>
        <DrawingToolbox
            v-if="show"
            class="draw-overlay"
            :drawing-modes="drawingModes"
            :current-drawing-mode="currentDrawingMode"
            :delete-last-point-callback="deleteLastPointCallback"
            :drawing-not-empty="drawingNotEmpty"
            :kml-ids="kmlIds"
            @close="hideDrawingOverlay"
            @setDrawingMode="changeDrawingMode"
            @export="exportDrawing"
            @clearDrawing="clearDrawing"
        />
        <DrawingStylePopup
            v-show="show && selectedFeature"
            ref="overlay"
            :feature="selectedFeature"
            :available-icon-sets="availableIconSets"
            @delete="deleteSelectedFeature"
            @close="deactivateFeature"
            @change="triggerKMLUpdate"
        />
        <div ref="draw-help" class="draw-help-popup"></div>
        <ProfilePopup
            :feature="selectedFeature"
            @delete="deleteSelectedFeature"
            @close="deactivateFeature"
        />
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { API_SERVICE_ICON_BASE_URL, IS_TESTING_WITH_CYPRESS } from '@/config'
import { drawingModes } from '@/modules/store/modules/drawing.store'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox'
import DrawingManager from '@/modules/drawing/lib/DrawingManager'
import { createEditingStyle, drawLineStyle, drawMeasureStyle } from '@/modules/drawing/lib/style'
import DrawingStylePopup from '@/modules/drawing/components/styling/DrawingStylePopup.vue'
import { Overlay } from 'ol'
import { createKml, updateKml } from '@/api/files.api'
import OverlayPositioning from 'ol/OverlayPositioning'
import { Point } from 'ol/geom'
import ProfilePopup from '@/modules/drawing/components/ProfilePopup'
import { saveAs } from 'file-saver'
import { SMALL } from '@/modules/drawing/lib/drawingStyleSizes'
import { RED } from '@/modules/drawing/lib/drawingStyleColor'

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
            kmlIds: (state) => state.drawing.drawingKmlIds,
            kmlLayers: (state) =>
                state.layers.activeLayers.filter((layer) => layer.visible && layer.kmlFileUrl),
            availableIconSets: (state) => state.drawing.iconSets,
        }),
        drawingModes: function () {
            const modes = []
            Object.keys(drawingModes).forEach((key) => modes.push(key))
            return modes
        },
        drawingNotEmpty: function () {
            return (
                this.manager && this.manager.source && this.manager.source.getFeatures().length > 0
            )
        },
        deleteLastPointCallback: function () {
            return this.currentDrawingMode === 'MEASURE' || this.currentDrawingMode === 'LINE'
                ? () => this.manager.activeInteraction.removeLastPoint()
                : undefined
        },
    },
    watch: {
        show: function (show) {
            if (show) {
                this.addSavedKmlLayer()
                this.manager.activate()
                // if icons have not yet been loaded, we do so
                if (this.availableIconSets.length === 0) {
                    this.loadAvailableIconSets()
                }
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
                        color: RED.fill,
                        description: '',
                    },
                },
                [drawingModes.MARKER]: {
                    drawOptions: {
                        type: 'Point',
                    },
                    properties: {
                        color: RED.fill,
                        font: 'normal 16px Helvetica',
                        icon: `${API_SERVICE_ICON_BASE_URL}icons/sets/default/icons/001-marker@1x-255,0,0.png`,
                        anchor: [0.5, 0.9],
                        text: '',
                        description: '',
                        textScale: SMALL.textScale,
                    },
                },
                [drawingModes.MEASURE]: {
                    drawOptions: {
                        type: 'Polygon',
                        minPoints: 2,
                        style: drawMeasureStyle,
                    },
                    properties: {
                        color: RED.fill,
                    },
                },
                [drawingModes.TEXT]: {
                    drawOptions: {
                        type: 'Point',
                    },
                    properties: {
                        color: RED.fill,
                        text: 'new text',
                        font: 'normal 16px Helvetica',
                        textScale: SMALL.textScale,
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
        this.manager.on('drawEnd', () => {
            this.setDrawingMode(null)
        })
    },
    methods: {
        ...mapActions([
            'toggleDrawingOverlay',
            'setDrawingMode',
            'setKmlIds',
            'removeLayer',
            'loadAvailableIconSets',
        ]),
        hideDrawingOverlay: function () {
            this.setDrawingMode(null)
            this.toggleDrawingOverlay()
        },
        changeDrawingMode: function (mode) {
            if (mode === this.currentDrawingMode) mode = null
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
                    if (kml && kml.length) {
                        this.saveDrawing(kml)
                    }
                },
                // when testing, speed up and avoid race conditions
                // by only waiting for next tick
                IS_TESTING_WITH_CYPRESS ? 0 : 2000
            )
        },
        saveDrawing: async function (kml) {
            let metadata
            if (!this.kmlIds || !this.kmlIds.adminId) {
                // if we don't have an adminId then create a new KML File
                metadata = await createKml(kml)
            } else {
                metadata = await updateKml(this.kmlIds.fileId, this.kmlIds.adminId, kml)
            }
            if (metadata) {
                this.setKmlIds({ adminId: metadata.adminId, fileId: metadata.id })
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
        clearDrawing: function () {
            this.manager.clearDrawing()
            this.triggerKMLUpdate()
        },
        addSavedKmlLayer: function () {
            if (!this.kmlLayers || !this.kmlLayers.length) {
                return
            }
            // Search for a layer with corresponding fileId or take last
            let layer
            if (this.kmlIds && this.kmlIds.fileId) {
                layer = this.kmlLayers.find((l) => l.fileId === this.kmlIds.fileId)
            } else {
                layer = this.kmlLayers[this.kmlLayers.length - 1]
            }
            // If KML layer exists add to drawing manager
            if (layer) {
                this.manager.addKmlLayer(layer).then(() => {
                    if (!this.kmlIds) {
                        this.triggerKMLUpdate()
                    }
                    // Remove the layer to not have an overlap with the drawing from
                    // the drawing manager
                    this.removeLayer(layer)
                })
            }
        },
    },
}
</script>

<style lang="scss" scoped>
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
