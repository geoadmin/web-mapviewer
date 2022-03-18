<template>
    <div>
        <DrawingToolbox
            v-if="show"
            :drawing-modes="drawingModes"
            :current-drawing-mode="currentDrawingMode"
            :delete-last-point-callback="deleteLastPointCallback"
            :drawing-not-empty="drawingNotEmpty"
            :kml-ids="kmlIds"
            :ui-mode="uiMode"
            @close="hideDrawingOverlay"
            @set-drawing-mode="changeDrawingMode"
            @export="exportDrawing"
            @clear-drawing="clearDrawing"
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
        <teleport v-if="readyForTeleport" to="#map-footer-middle">
            <ProfilePopup
                :feature="selectedFeature"
                :ui-mode="uiMode"
                @delete="deleteSelectedFeature"
                @close="deactivateFeature"
            />
        </teleport>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { drawingModes } from '@/modules/store/modules/drawing.store'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox.vue'
import DrawingManager from '@/modules/drawing/lib/DrawingManager'
import { createEditingStyle, drawLineStyle, drawMeasureStyle } from '@/modules/drawing/lib/style'
import DrawingStylePopup from '@/modules/drawing/components/styling/DrawingStylePopup.vue'
import { Overlay } from 'ol'
import { createKml, updateKml } from '@/api/files.api'
import OverlayPositioning from 'ol/OverlayPositioning'
import { Point } from 'ol/geom'
import ProfilePopup from '@/modules/drawing/components/ProfilePopup.vue'
import { saveAs } from 'file-saver'
import { SMALL, MEDIUM } from '@/modules/drawing/lib/drawingStyleSizes'
import { RED } from '@/modules/drawing/lib/drawingStyleColor'

const overlay = new Overlay({
    offset: [0, 15],
    positioning: OverlayPositioning.TOP_CENTER,
    className: 'drawing-style-overlay',
})

export default {
    components: { DrawingToolbox, DrawingStylePopup, ProfilePopup },
    inject: ['getMap'],
    data() {
        return {
            selectedFeature: null,
            drawingModes: Object.values(drawingModes),
            drawingNotEmpty: false,
            /** Delay teleport until view is rendered. Updated in mounted-hook. */
            readyForTeleport: false,
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
            uiMode: (state) => state.ui.mode,
        }),
        deleteLastPointCallback() {
            return this.currentDrawingMode === 'MEASURE' || this.currentDrawingMode === 'LINE'
                ? () => this.manager.activeInteraction.removeLastPoint()
                : undefined
        },
    },
    watch: {
        show(show) {
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
        currentDrawingMode(mode) {
            this.manager.toggleTool(mode)
        },
        kmlIds(kmlIds) {
            // When removing a Drawing layer, the kmlIds are cleared. In this case
            // we also need to clear the drawing in the manager which still contain
            // the last drawing.
            if (!kmlIds) {
                this.manager.clearDrawing()
            }
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
                    // These properties need to be evaluated later as the
                    // availableIconSets aren't ready when this component is mounted.
                    properties: () => {
                        const defaultIconSet = this.availableIconSets.find(
                            (set) => set.name === 'default'
                        )
                        const defaultIcon = defaultIconSet.icons[0]

                        return {
                            color: RED.fill,
                            font: 'normal 16px Helvetica',
                            icon: defaultIcon.generateURL(defaultIconSet.name, MEDIUM, RED),
                            anchor: defaultIcon.anchor,
                            text: '',
                            description: '',
                            textScale: SMALL.textScale,
                        }
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
            window.drawingManager = this.manager
        }
        this.manager.on('change', this.onChange)
        this.manager.on('clear', this.onClear)
        this.manager.on('select', this.onSelect)
        this.manager.on('drawEnd', () => {
            this.setDrawingMode(null)
        })

        // We can enable the teleport after the view has been rendered.
        this.$nextTick(() => {
            this.readyForTeleport = true
        })
    },
    unmounted() {
        clearTimeout(this.KMLUpdateTimeout)
    },
    methods: {
        ...mapActions([
            'toggleDrawingOverlay',
            'setDrawingMode',
            'setKmlIds',
            'removeLayer',
            'loadAvailableIconSets',
        ]),
        hideDrawingOverlay() {
            this.setDrawingMode(null)
            this.toggleDrawingOverlay()
        },
        changeDrawingMode(mode) {
            if (mode === this.currentDrawingMode) {
                mode = null
            }
            this.setDrawingMode(mode)
        },
        deleteSelectedFeature() {
            this.manager.deleteSelected()
        },
        deactivateFeature() {
            this.manager.deselect()
        },
        isDrawingEmpty() {
            return (
                this.manager && this.manager.source && this.manager.source.getFeatures().length > 0
            )
        },
        triggerKMLUpdate() {
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
        onChange() {
            this.drawingNotEmpty = this.isDrawingEmpty()
            this.triggerKMLUpdate()
        },
        onClear() {
            this.drawingNotEmpty = this.isDrawingEmpty()
            // Only trigger the kml update if we have an active open drawing. The clear
            // event also happens when removing a drawing layer when the drawing menu
            // is closed and in this condition we don't want to re-created now a new KML
            // until the menu is opened again.
            if (this.show) {
                this.triggerKMLUpdate()
            }
        },
        onSelect(event) {
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
        },
        async saveDrawing(kml) {
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
        exportDrawing(gpx = false) {
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
        clearDrawing() {
            this.manager.clearDrawing()
            this.triggerKMLUpdate()
        },
        addSavedKmlLayer() {
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
        margin-left: -6px;
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
