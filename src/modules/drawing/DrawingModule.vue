<template>
    <div>
        <DrawingToolbox
            v-if="show"
            :current-drawing-mode="currentDrawingMode"
            :is-drawing-empty="isDrawingEmpty"
            :kml-ids="kmlIds"
            :ui-mode="uiMode"
            @close="hideDrawingOverlay"
            @set-drawing-mode="changeDrawingMode"
            @clear-drawing="clearDrawing"
            @delete-last-point="removeLastPoint"
        />
        <DrawingTooltip
            v-if="show"
            :current-drawing-mode="currentDrawingMode"
            :selected-features="selectedFeatures"
        />
        <teleport v-if="readyForTeleport" to="#map-footer-middle">
            <ProfilePopup
                :feature="selectedFeatures"
                :ui-mode="uiMode"
                @delete="deleteSelectedFeature"
                @close="clearAllSelectedFeatures"
            />
        </teleport>
        <DrawingSelectInteraction
            ref="selectInteraction"
            :selected-features="selectedFeatures"
            @feature-select="onFeatureSelect"
            @feature-unselect="onFeatureUnselect"
        >
            <!-- As modify interaction needs access to the selected features we embed it into
            the select interaction component, this component will share its feature
            through a provide/inject -->
            <DrawingModifyInteraction
                :selected-features="selectedFeatures"
                @feature-is-dragged="onFeatureIsDragged"
                @feature-is-dropped="onFeatureIsDropped"
                @modify-end="onChange"
            />
        </DrawingSelectInteraction>
        <DrawingMarkerInteraction
            v-if="show && isDrawingModeMarker"
            ref="markerInteraction"
            :available-icon-sets="availableIconSets"
            @draw-end="onDrawEnd"
        />
        <DrawingTextInteraction
            v-if="show && isDrawingModeAnnotation"
            ref="textInteraction"
            @draw-end="onDrawEnd"
        />
        <DrawingLineInteraction
            v-if="show && isDrawingModeLine"
            ref="lineInteraction"
            @draw-end="onDrawEnd"
        />
        <DrawingMeasureInteraction
            v-if="show && isDrawingModeMeasure"
            ref="measureInteraction"
            @draw-end="onDrawEnd"
        />
    </div>
</template>

<script>
import { createKml, updateKml } from '@/api/files.api'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import DrawingLineInteraction from '@/modules/drawing/components/DrawingLineInteraction.vue'
import DrawingMarkerInteraction from '@/modules/drawing/components/DrawingMarkerInteraction.vue'
import DrawingMeasureInteraction from '@/modules/drawing/components/DrawingMeasureInteraction.vue'
import DrawingModifyInteraction from '@/modules/drawing/components/DrawingModifyInteraction.vue'
import DrawingSelectInteraction from '@/modules/drawing/components/DrawingSelectInteraction.vue'
import DrawingTextInteraction from '@/modules/drawing/components/DrawingTextInteraction.vue'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox.vue'
import DrawingTooltip from '@/modules/drawing/components/DrawingTooltip.vue'
import ProfilePopup from '@/modules/drawing/components/ProfilePopup.vue'
import { generateKmlString } from '@/modules/drawing/lib/export-utils'
import { DrawingModes } from '@/modules/store/modules/drawing.store'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { mapActions, mapState } from 'vuex'

export default {
    components: {
        DrawingSelectInteraction,
        DrawingModifyInteraction,
        DrawingTextInteraction,
        DrawingMeasureInteraction,
        DrawingLineInteraction,
        DrawingMarkerInteraction,
        DrawingTooltip,
        DrawingToolbox,
        ProfilePopup,
    },
    inject: ['getMap'],
    provide() {
        return {
            // sharing OL stuff for children drawing components
            getDrawingLayer: () => this.drawingLayer,
        }
    },
    data() {
        return {
            drawingModes: Object.values(DrawingModes),
            isDrawingEmpty: true,
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
            selectedFeatures: (state) => state.features.selectedFeatures,
        }),
        isDrawingModeMarker() {
            return this.currentDrawingMode === DrawingModes.MARKER
        },
        isDrawingModeAnnotation() {
            return this.currentDrawingMode === DrawingModes.ANNOTATION
        },
        isDrawingModeLine() {
            return this.currentDrawingMode === DrawingModes.LINEPOLYGON
        },
        isDrawingModeMeasure() {
            return this.currentDrawingMode === DrawingModes.MEASURE
        },
        currentlySelectedFeature() {
            // there can only be one drawing feature edited at the same time
            if (this.selectedFeatures.length === 1) {
                return this.selectedFeatures[0]
            }
            return null
        },
        currentInteraction() {
            if (this.isDrawingModeAnnotation) {
                return this.$refs.textInteraction
            } else if (this.isDrawingModeMeasure) {
                return this.$refs.measureInteraction
            } else if (this.isDrawingModeLine) {
                return this.$refs.lineInteraction
            } else if (this.isDrawingModeMarker) {
                return this.$refs.markerInteraction
            }
            return null
        },
    },
    watch: {
        show(show) {
            if (show) {
                // if a KML was previously created with the drawing module
                // we add it back for further editing
                this.addSavedKmlLayer()
                this.getMap().addLayer(this.drawingLayer)
            } else {
                this.getMap().removeLayer(this.drawingLayer)
            }
        },
        // kmlIds: function (kmlIds) {
        //     // When removing as Drawing layer, the kmlIds are cleared. In this case
        //     // we also need to clear the drawing in the manager which still contain
        //     // the last drawing.
        //     if (!kmlIds) {
        //         this.manager.clearDrawing()
        //     }
        // },
    },
    created() {
        this.drawingLayer = new VectorLayer({
            source: new VectorSource({ useSpatialIndex: false }),
        })
        // if icons have not yet been loaded, we do so
        if (this.availableIconSets.length === 0) {
            this.loadAvailableIconSets()
        }
    },
    mounted() {
        // We can enable the teleport after the view has been rendered.
        this.$nextTick(() => {
            this.readyForTeleport = true
        })
        // listening for "Delete" keystroke (in order to remove last point when drawing lines or measure)
        document.addEventListener('keyup', this.onKeyUp)
    },
    unmounted() {
        document.removeEventListener('keyup', this.onKeyUp)
        clearTimeout(this.KMLUpdateTimeout)
    },
    methods: {
        ...mapActions([
            'toggleDrawingOverlay',
            'setDrawingMode',
            'setKmlIds',
            'removeLayer',
            'loadAvailableIconSets',
            'setSelectedFeatures',
            'clearAllSelectedFeatures',
            'changeFeatureCoordinates',
            'changeFeatureIsDragged',
        ]),
        hideDrawingOverlay() {
            this.setDrawingMode(null)
            this.toggleDrawingOverlay()
        },
        changeDrawingMode(mode) {
            // we de-activate the mode if the same button is pressed twice
            // (if the current mode is equal to the one received)
            if (mode === this.currentDrawingMode) {
                this.setDrawingMode(null)
            } else {
                this.setDrawingMode(mode)
            }
        },
        deleteSelectedFeature() {
            this.deleteSelected()
        },
        triggerKMLUpdate() {
            clearTimeout(this.KMLUpdateTimeout)
            this.KMLUpdateTimeout = setTimeout(
                () => {
                    const kml = generateKmlString(this.drawingLayer.getSource().getFeatures())
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
            this.isDrawingEmpty = this.drawingLayer.getSource().getFeatures().length === 0
            // this.triggerKMLUpdate()
        },
        onClear() {
            // Only trigger the kml update if we have an active open drawing. The clear
            // event also happens when removing a drawing layer when the drawing menu
            // is closed and in this condition we don't want to re-created now a new KML
            // until the menu is opened again.
            // if (this.show) {
            //     this.triggerKMLUpdate()
            // }
        },
        onDrawEnd(feature) {
            this.$refs.selectInteraction.selectFeature(feature)
            // de-selecting the current tool (drawing mode)
            this.setDrawingMode(null)
        },
        /** See {@link DrawingModifyInteraction} events */
        onFeatureIsDragged(feature) {
            this.changeFeatureIsDragged({
                feature: feature,
                isDragged: true,
            })
        },
        /** See {@link DrawingModifyInteraction} events */
        onFeatureIsDropped({ feature, coordinates }) {
            this.changeFeatureIsDragged({
                feature: feature,
                isDragged: false,
            })
            this.changeFeatureCoordinates({
                feature: feature,
                coordinates: coordinates,
            })
        },
        /** See {@link DrawingSelectInteraction} events */
        onFeatureSelect(feature) {
            this.setSelectedFeatures([feature])
        },
        /** See {@link DrawingSelectInteraction} events */
        onFeatureUnselect() {
            // emptying selected features in the store
            this.clearAllSelectedFeatures()
        },
        onKeyUp(event) {
            if (event.key === 'Delete') {
                // drawing modes will be checked by the function itself (no need to double-check)
                this.removeLastPoint()
            }
        },
        removeLastPoint() {
            if (this.isDrawingModeMeasure || this.isDrawingModeLine) {
                this.currentInteraction.removeLastPoint()
            }
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
        clearDrawing: function () {
            this.clearAllSelectedFeatures()
            this.$refs.selectInteraction.clearSelectedFeature()
            this.drawingLayer.getSource().clear()
            this.onChange()
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
/* Unscoped style as what is described below will not be wrapped 
in this component but added straight the the OpenLayers map */
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
