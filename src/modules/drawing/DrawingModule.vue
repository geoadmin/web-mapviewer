<template>
    <div>
        <DrawingToolbox
            v-if="show"
            :current-drawing-mode="currentDrawingMode"
            :is-drawing-empty="isDrawingEmpty"
            :kml-layer-id="kmlLayerId"
            :kml-admin-id="kmlAdminId"
            :drawing-state="drawingState"
            @close="toggleDrawingOverlay"
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
        <DrawingSelectInteraction ref="selectInteraction" @feature-change="onChange">
            <!-- As modify interaction needs access to the selected features we embed it into
            the select interaction component, this component will share its feature
            through a provide/inject -->
            <DrawingModifyInteraction @modify-end="onChange" @modify-start="willModify" />
        </DrawingSelectInteraction>
        <DrawingMarkerInteraction
            v-if="show && isDrawingModeMarker"
            ref="markerInteraction"
            :available-icon-sets="availableIconSets"
            @draw-start="onDrawStart"
            @draw-end="onDrawEnd"
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
        <LoadingScreen v-if="isLoading" />
    </div>
</template>

<script>
import { EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import { createKml, getKml, updateKml, getKmlUrl } from '@/api/files.api'
import KMLLayer from '@/api/layers/KMLLayer.class'
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
import LoadingScreen from '@/utils/LoadingScreen.vue'
import log from '@/utils/logging'
import KML from 'ol/format/KML'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { mapActions, mapState, mapGetters } from 'vuex'
import { DrawingState } from './lib/export-utils'

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
        LoadingScreen,
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
            drawingModes: Object.values(EditableFeatureTypes),
            isDrawingEmpty: true,
            currentlySketchedFeature: null,
            isLoading: false,
            /** Delay teleport until view is rendered. Updated in mounted-hook. */
            readyForTeleport: false,
            drawingState: DrawingState.INITIAL,
            kmlLayer: null,
            isNewDrawing: true,
        }
    },
    computed: {
        ...mapGetters(['activeKmlLayer']),
        ...mapState({
            show: (state) => state.ui.showDrawingOverlay,
            currentDrawingMode: (state) => state.drawing.mode,
            availableIconSets: (state) => state.drawing.iconSets,
            selectedFeatures: (state) => state.features.selectedFeatures,
            featureIds: (state) => state.drawing.featureIds,
        }),
        kmlLayerId() {
            return this.kmlLayer?.getID()
        },
        kmlAdminId() {
            return this.kmlLayer?.adminId
        },
        isDrawingModeMarker() {
            return this.currentDrawingMode === EditableFeatureTypes.MARKER
        },
        isDrawingModeAnnotation() {
            return this.currentDrawingMode === EditableFeatureTypes.ANNOTATION
        },
        isDrawingModeLine() {
            return this.currentDrawingMode === EditableFeatureTypes.LINEPOLYGON
        },
        isDrawingModeMeasure() {
            return this.currentDrawingMode === EditableFeatureTypes.MEASURE
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
        isDrawingModified() {
            switch (this.drawingState) {
                case DrawingState.INITIAL:
                case DrawingState.LOADED:
                case DrawingState.LOAD_ERROR:
                    return false
                default:
                    return true
            }
        },
    },
    watch: {
        async show(show) {
            if (show) {
                this.isLoading = true
                this.isDrawingOpen = true
                await this.showDrawingOverlay()
                this.isLoading = false
            } else {
                this.isLoading = true
                await this.hideDrawingOverlay()
                this.isDrawingOpen = false
                this.isLoading = false
            }
        },
        featureIds(next, last) {
            const removed = last.filter((id) => !next.includes(id))
            if (removed.length > 0) {
                log.debug(
                    `${removed.length} feature(s) have been removed, removing them from source`
                )
                const source = this.drawingLayer.getSource()
                source
                    .getFeatures()
                    .filter((feature) => removed.includes(feature.getId()))
                    .forEach((feature) => source.removeFeature(feature))
                this.onChange()
            }
        },
        activeKmlLayer(layer) {
            this.openDrawingOnAdminId(layer)
        },
    },
    created() {
        this.drawingLayer = new VectorLayer({
            source: new VectorSource({ useSpatialIndex: false, wrapX: true }),
        })
        this.drawingLayer.setZIndex(9999)
        // if icons have not yet been loaded, we do so
        if (this.availableIconSets.length === 0) {
            this.loadAvailableIconSets()
        }
        // we might have passed some notification from watcher before the create
        // event, therefore handle them once here
        this.openDrawingOnAdminId(this.activeKmlLayer)
    },
    mounted() {
        // We can enable the teleport after the view has been rendered.
        this.$nextTick(() => {
            this.readyForTeleport = true
        })
        // listening for "Delete" keystroke (in order to remove last point when drawing lines or measure)
        document.addEventListener('keyup', this.onKeyUp)

        if (IS_TESTING_WITH_CYPRESS) {
            window.drawingLayer = this.drawingLayer
        }
    },
    unmounted() {
        document.removeEventListener('keyup', this.onKeyUp)
        clearTimeout(this.differSaveDrawingTimeout)

        if (IS_TESTING_WITH_CYPRESS) {
            delete window.drawingLayer
        }
    },
    methods: {
        ...mapActions([
            'toggleDrawingOverlay',
            'setDrawingMode',
            'removeLayer',
            'addLayer',
            'loadAvailableIconSets',
            'clearAllSelectedFeatures',
            'addDrawingFeature',
            'clearDrawingFeatures',
            'setDrawingFeatures',
            'setShowDrawingOverlay',
        ]),
        async showDrawingOverlay() {
            this.drawingState = DrawingState.INITIAL
            this.isNewDrawing = true

            // if a KML was previously created with the drawing module
            // we add it back for further editing
            if (this.activeKmlLayer) {
                log.debug(`Add current active kml layer to drawing`, this.activeKmlLayer)
                this.isNewDrawing = this.activeKmlLayer.adminId ? false : true
                await this.addKmlLayerToDrawing(this.activeKmlLayer)
                // Take ownership of the KML Layer before removing it from the active layers
                this.kmlLayer = this.activeKmlLayer
                // Remove the layer to not have an overlap with the drawing from
                // the drawing manager. We even remove this if the kml load failed as
                // this layer is not selectable.
                this.removeLayer(this.activeKmlLayer.getID())
            }
            this.isDrawingEmpty = this.drawingLayer.getSource().getFeatures().length === 0
            this.getMap().addLayer(this.drawingLayer)
        },
        async hideDrawingOverlay() {
            log.debug(
                `Closing drawing menu: isModified=${this.isDrawingModified}, isNew=${this.isNewDrawing}, isEmpty=${this.isDrawingEmpty}`
            )
            // be sure to cancel all auto retry when leaving the drawing mode
            clearTimeout(this.differSaveDrawingTimeout)
            clearTimeout(this.addKmlLayerTimeout)
            this.clearAllSelectedFeatures()
            this.setDrawingMode(null)

            // We only trigger a kml save onClose drawing menu when the drawing has been
            // modified and that it is either not empty or not a new drawing. We don't
            // want to save new empty drawing but we want to allow to clear existing
            // drawing.
            if (this.isDrawingModified && (!this.isNewDrawing || !this.isDrawingEmpty)) {
                await this.saveDrawing(false) // do not retry on error
            }

            // Only add existing/saved kml to the layer menu. If someone cleared an
            // existing kml, we want to allow him to re-edit it.
            if (this.kmlLayer) {
                // We clear the admind ID, so that by next drawing mode enter we start with
                // a copy and not overwrite the drawing. To modify the drawing again we need to
                // set the adminId in the url again.
                this.kmlLayer.clearAdminId()
                this.addLayer(this.kmlLayer)
                this.kmlLayer = null
            }

            // Next tick is needed to wait that all overlays are correctly updated so that
            // they can be correctly removed with the map
            await this.$nextTick()
            this.drawingLayer.getSource().clear()
            this.getMap().removeLayer(this.drawingLayer)
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
        differSaveDrawing(time = 2000) {
            clearTimeout(this.differSaveDrawingTimeout)
            this.differSaveDrawingTimeout = setTimeout(
                this.saveDrawing,
                // when testing, speed up and avoid race conditions
                // by only waiting for a small amount of time.
                // WARNING: don't use 0 here otherwise on CYPRESS you will end up with more request
                // than needed!
                IS_TESTING_WITH_CYPRESS ? 100 : time
            )
        },
        async saveDrawing(retryOnError = true) {
            log.debug(`Save drawing retryOnError ${retryOnError}`)
            this.drawingState = DrawingState.SAVING
            clearTimeout(this.differSaveDrawingTimeout)
            const kml = generateKmlString(this.drawingLayer.getSource().getFeatures())
            try {
                if (!this.kmlLayer?.adminId) {
                    // if we don't have an adminId then create a new KML File
                    const metadata = await createKml(kml)
                    this.kmlLayer = new KMLLayer(
                        getKmlUrl(metadata.id),
                        true, // visible
                        null, // opacity, null := use default
                        metadata.id,
                        metadata.adminId,
                        this.$t('draw_layer_label'),
                        metadata
                    )
                } else {
                    const metadata = await updateKml(
                        this.kmlLayer.fileId,
                        this.kmlLayer.adminId,
                        kml
                    )
                    this.kmlLayer.metadata = metadata
                }

                // New pending changes might have occurred during the saving, therefore do not
                // overwrite this state.
                if (this.drawingState !== DrawingState.UNSAVED_CHANGES) {
                    this.drawingState = DrawingState.SAVED
                }
            } catch (e) {
                log.error('Could not save KML layer: ', e)
                this.drawingState = DrawingState.SAVE_ERROR
                if (!IS_TESTING_WITH_CYPRESS && retryOnError) {
                    // Retry saving in 5 seconds
                    this.differSaveDrawing(5000)
                }
            }
        },
        onChange() {
            log.debug(`Drawing changed`)
            this.willModify()
            // Here we need to do the onChange() event work in next tick in order to have the
            // drawingLayer source updated otherwise the source might not yet be updated with
            // the new/updated/deleted feature
            this.$nextTick(() => {
                this.isDrawingEmpty = this.drawingLayer.getSource().getFeatures().length === 0
                this.differSaveDrawing()
            })
        },
        onDrawStart(feature) {
            this.currentlySketchedFeature = feature
            /* Do not call willModify() here as we are not sure if there will be any modification
            (maybe the user decides to cancel the drawing) */
        },

        /**
         * Call this method when there are or when there will be unsaved changes. Change the saving
         * status to "possibly unsaved changes"
         */
        willModify() {
            if (this.drawingState !== DrawingState.SAVE_ERROR) {
                this.drawingState = DrawingState.UNSAVED_CHANGES
            }
        },
        onDrawEnd(feature) {
            log.debug(`Drawing ended`, feature)
            this.currentlySketchedFeature = null
            this.$refs.selectInteraction.selectFeature(feature)
            // de-selecting the current tool (drawing mode)
            this.setDrawingMode(null)
            this.addDrawingFeature(feature.getId())
            this.onChange()
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
        clearDrawing: function () {
            this.willModify()
            this.clearDrawingFeatures()
            this.clearAllSelectedFeatures()
            this.drawingLayer.getSource().clear()
            this.onChange()
        },
        differAddKmlLayerToDrawing(layer, time = 2000) {
            this.addKmlLayerTimeout = setTimeout(this.addKmlLayerToDrawing, time, layer)
        },
        async addKmlLayerToDrawing(layer, retryOnError = true) {
            clearTimeout(this.addKmlLayerTimeout)
            try {
                const kml = await getKml(layer.fileId)
                const features = new KML().readFeatures(kml, {
                    featureProjection: layer.projection,
                })
                features.forEach((olFeature) => {
                    EditableFeature.deserialize(olFeature, this.availableIconSets)
                })
                this.drawingLayer.getSource().addFeatures(features)
                this.setDrawingFeatures(features.map((feature) => feature.getId()))
                this.drawingState = DrawingState.LOADED
            } catch (error) {
                log.error(`Failed to load KML ${layer.fileId}`, error, layer)
                this.drawingState = DrawingState.LOAD_ERROR
                if (!IS_TESTING_WITH_CYPRESS && retryOnError) {
                    this.differAddKmlLayerToDrawing(layer)
                }
            }
        },
        async openDrawingOnAdminId(layer) {
            if (layer?.adminId && !this.isDrawingOpen && !layer?.isLegacy()) {
                await this.setShowDrawingOverlay(true)
            }
        },
    },
}
</script>

<style lang="scss">
/* Unscoped style as what is described below will not be wrapped
in this component but added straight the the OpenLayers map */

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
