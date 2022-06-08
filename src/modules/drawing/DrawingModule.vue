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
            :currently-sketched-feature="currentlySketchedFeature"
        />
        <DrawingSelectInteraction
            ref="selectInteraction"
            :selected-features="selectedFeatures"
            @feature-select="onFeatureSelect"
            @feature-unselect="onFeatureUnselect"
            @feature-change="onChange"
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
            @draw-start="onDrawStart"
            @draw-end="onDrawEnd"
            @feature-add="onAddFeature"
        />
        <DrawingTextInteraction
            v-if="show && isDrawingModeAnnotation"
            ref="textInteraction"
            @draw-start="onDrawStart"
            @draw-end="onDrawEnd"
        />
        <DrawingLineInteraction
            v-if="show && isDrawingModeLine"
            ref="lineInteraction"
            @draw-start="onDrawStart"
            @draw-end="onDrawEnd"
        />
        <DrawingMeasureInteraction
            v-if="show && isDrawingModeMeasure"
            ref="measureInteraction"
            @draw-start="onDrawStart"
            @draw-end="onDrawEnd"
        />
    </div>
</template>

<script>
import { createKml, getKml, updateKml } from '@/api/files.api'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import DrawingLineInteraction from '@/modules/drawing/components/DrawingLineInteraction.vue'
import DrawingMarkerInteraction from '@/modules/drawing/components/DrawingMarkerInteraction.vue'
import DrawingMeasureInteraction from '@/modules/drawing/components/DrawingMeasureInteraction.vue'
import DrawingModifyInteraction from '@/modules/drawing/components/DrawingModifyInteraction.vue'
import DrawingSelectInteraction from '@/modules/drawing/components/DrawingSelectInteraction.vue'
import DrawingTextInteraction from '@/modules/drawing/components/DrawingTextInteraction.vue'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox.vue'
import DrawingTooltip from '@/modules/drawing/components/DrawingTooltip.vue'
import { generateKmlString } from '@/modules/drawing/lib/export-utils'
import { featureStyleFunction } from '@/modules/drawing/lib/style'
import { DrawingModes } from '@/store/modules/drawing.store'
import { deserializeAnchor } from '@/utils/featureAnchor'
import KML from 'ol/format/KML'
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
            currentlySketchedFeature: null,
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
            featureIds: (state) => state.drawing.featureIds,
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
        featureIds(next, last) {
            const removed = last.filter((id) => !next.includes(id))
            if (removed.length > 0) {
                const source = this.drawingLayer.getSource()
                source
                    .getFeatures()
                    .filter((feature) => removed.includes(feature.getId()))
                    .forEach((feature) => source.removeFeature(feature))
            }
        },
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
        // We need to clear the vector source when the drawing layer is removed from the active layers.
        this.unsubscribeKmlIds = this.$store.subscribe((mutation) => {
            if (mutation.type === 'setKmlIds' && mutation.payload === null) {
                this.drawingLayer.getSource().clear()
            }
        })

        if (IS_TESTING_WITH_CYPRESS) {
            window.drawingLayer = this.drawingLayer
        }
    },
    unmounted() {
        document.removeEventListener('keyup', this.onKeyUp)
        clearTimeout(this.KMLUpdateTimeout)
        this.unsubscribeKmlIds()

        if (IS_TESTING_WITH_CYPRESS) {
            delete window.drawingLayer
        }
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
            'addDrawingFeature',
        ]),
        hideDrawingOverlay() {
            this.clearAllSelectedFeatures()
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
            this.$nextTick(() => {
                this.isDrawingEmpty = this.drawingLayer.getSource().getFeatures().length === 0
                this.triggerKMLUpdate()
            })
        },
        onDrawStart(feature) {
            this.currentlySketchedFeature = feature
        },
        onDrawEnd(feature) {
            this.currentlySketchedFeature = null
            this.$refs.selectInteraction.selectFeature(feature)
            // de-selecting the current tool (drawing mode)
            this.setDrawingMode(null)
            this.onChange()
        },
        onAddFeature(featureId) {
            this.addDrawingFeature(featureId)
        },
        /** See {@link DrawingModifyInteraction} events */
        onFeatureIsDragged(feature) {
            this.changeFeatureIsDragged({
                feature: feature,
                isDragged: true,
            })
            this.onChange()
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
            this.onChange()
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
        async addSavedKmlLayer() {
            if (!this.kmlLayers?.length) {
                return
            }
            // Search for a layer with corresponding fileId or take last
            const index = this.kmlIds?.fileId
                ? this.kmlLayers.findIndex((l) => l.fileId === this.kmlIds.fileId)
                : this.kmlLayers.length - 1
            const layer = this.kmlLayers[index]

            // If KML layer exists add to drawing manager
            if (layer) {
                await this.addKmlLayer(layer)
                if (!this.kmlIds) {
                    this.triggerKMLUpdate()
                }
                // Remove the layer to not have an overlap with the drawing from
                // the drawing manager
                this.removeLayer(layer)
            }
        },
        async addKmlLayer(layer) {
            const kml = await getKml(layer.fileId)
            const features = new KML().readFeatures(kml, {
                featureProjection: layer.projection,
            })
            features.forEach((feature) => {
                // The following deserialization is a hack. See @module comment in file.
                deserializeAnchor(feature)
                feature.setStyle(featureStyleFunction)
                if (feature.get('drawingMode') === DrawingModes.MEASURE) {
                    this.measureManager.addOverlays(feature)
                }
            })
            this.drawingLayer.getSource().addFeatures(features)
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
