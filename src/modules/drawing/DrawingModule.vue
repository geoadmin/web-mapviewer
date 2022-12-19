<template>
    <div>
        <DrawingToolbox
            v-if="show"
            :current-drawing-mode="currentDrawingMode"
            :is-drawing-empty="isDrawingEmpty"
            :kml-ids="kmlIds"
            :saving-status="savingStatus"
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
import LayerTypes from '@/api/layers/LayerTypes.enum'
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
import { mapActions, mapGetters, mapState } from 'vuex'
import { SavingStatus } from './lib/export-utils'

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
            savingStatus: SavingStatus.INITIAL,
            kmlIds: null,
            isNewDrawing: true,
        }
    },
    computed: {
        ...mapState({
            show: (state) => state.ui.showDrawingOverlay,
            currentDrawingMode: (state) => state.drawing.mode,
            visibleKmlLayers: (state) =>
                state.layers.activeLayers.filter(
                    (layer) => layer.visible && layer.type === LayerTypes.KML
                ),
            availableIconSets: (state) => state.drawing.iconSets,
            selectedFeatures: (state) => state.features.selectedFeatures,
            featureIds: (state) => state.drawing.featureIds,
        }),
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
            return this.savingStatus !== SavingStatus.INITIAL
        },
    },
    watch: {
        async show(show) {
            /**
             * Makes it possible to abort the toggle on error by setting
             * "this.abortedToggleOverlay=true" before calling "this.toggleDrawingOverlay()", as
             * calling "this.toggleDrawingOverlay()" will retrigger this function.
             */
            if (this.abortedToggleOverlay) {
                this.abortedToggleOverlay = false
                return
            }
            this.isLoading = true
            try {
                if (show) {
                    this.savingStatus = SavingStatus.INITIAL
                    this.isNewDrawing = true
                    this.kmlIds = null

                    // if a KML was previously created with the drawing module
                    // we add it back for further editing
                    if (this.visibleKmlLayers.length) {
                        // always edit the last visible kml layer
                        const layer = this.visibleKmlLayers[this.visibleKmlLayers.length - 1]
                        this.isNewDrawing = layer.adminId ? false : true
                        this.kmlIds = { adminId: layer.adminId, fileId: layer.fileId }
                        await this.addKmlLayerToDrawing(layer)
                    }
                    this.isDrawingEmpty = this.drawingLayer.getSource().getFeatures().length === 0
                    this.getMap().addLayer(this.drawingLayer)
                } else {
                    log.debug(
                        `Closing drawing menu: isModified=${this.isDrawingModified}, isNew=${this.isNewDrawing}, isEmpty=${this.isDrawingEmpty}`
                    )
                    this.clearAllSelectedFeatures()
                    this.setDrawingMode(null)
                    // We only trigger a kml save onClose drawing menu when the drawing has been
                    // modified and that it is either not empty or not a new drawing. We don't
                    // want to save new empty drawing but we want to allow to clear existing
                    // drawing.
                    if (this.isDrawingModified && (!this.isNewDrawing || !this.isDrawingEmpty)) {
                        await this.triggerImmediateKMLUpdate()
                    }

                    // Only add existing/saved kml to the layer menu. If someone cleared an
                    // existing kml, we want to allow him to re-edit it.
                    if (this.kmlIds) {
                        this.addLayer(
                            new KMLLayer(
                                1.0,
                                getKmlUrl(this.kmlIds.fileId),
                                this.kmlIds.fileId,
                                this.kmlIds.adminId
                            )
                        )
                    }

                    this.drawingLayer.getSource().clear()

                    // Next tick is needed to wait that all overlays are correctly updated so that
                    // they can be correctly removed with the map
                    this.$nextTick(() => {
                        this.getMap().removeLayer(this.drawingLayer)
                    })
                }
            } catch (e) {
                // Here a better logic for handeling network errors could be added
                // (e.g. user feedback)
                const e_msg = show
                    ? 'Aborted opening of drawing mode. Could not add existent KML layer: '
                    : 'Aborted closing of drawing mode. Could not save KML layer: '
                log.error(e_msg, e.code, e)
                // Abort the toggle to give the user a chance to reconnect to the internet and
                // so to not loose his drawing
                this.abortedToggleOverlay = true
                this.toggleDrawingOverlay()
            } finally {
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

        /**
         * Flag used internally in the "show(show)" watcher function. Look at the comment at the top
         * of the beforementioned function to understand how this flag is used.
         */
        this.abortedToggleOverlay = false
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
        clearTimeout(this.KMLUpdateTimeout)

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
        ]),
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
                this.triggerImmediateKMLUpdate,
                // when testing, speed up and avoid race conditions
                // by only waiting for next tick
                IS_TESTING_WITH_CYPRESS ? 0 : 2000
            )
        },
        async triggerImmediateKMLUpdate() {
            clearTimeout(this.KMLUpdateTimeout)
            const kml = generateKmlString(this.drawingLayer.getSource().getFeatures())
            if (kml && kml.length) {
                this.savingStatus = SavingStatus.SAVING
                try {
                    await this.saveDrawing(kml)
                } catch (e) {
                    log.error('Could not save KML layer: ', e)
                    this.savingStatus = SavingStatus.SAVE_ERROR
                    throw e
                }
                if (this.savingStatus !== SavingStatus.UNSAVED_CHANGES) {
                    this.savingStatus = SavingStatus.SAVED
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
                this.triggerKMLUpdate()
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
            if (this.savingStatus !== SavingStatus.SAVE_ERROR) {
                this.savingStatus = SavingStatus.UNSAVED_CHANGES
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
        async saveDrawing(kml) {
            let metadata
            if (!this.kmlIds || !this.kmlIds.adminId) {
                // if we don't have an adminId then create a new KML File
                metadata = await createKml(kml)
                if (metadata) {
                    this.kmlIds = { adminId: metadata.adminId, fileId: metadata.id }
                }
            } else {
                metadata = await updateKml(this.kmlIds.fileId, this.kmlIds.adminId, kml)
            }
        },
        clearDrawing: function () {
            this.willModify()
            this.clearDrawingFeatures()
            this.clearAllSelectedFeatures()
            this.drawingLayer.getSource().clear()
            this.onChange()
        },
        async addKmlLayerToDrawing(layer) {
            await this.addKmlDrawingLayer(layer)
            // Remove the layer to not have an overlap with the drawing from
            // the drawing manager
            this.removeLayer(layer)
        },
        async addKmlDrawingLayer(layer) {
            const kml = await getKml(layer.fileId)
            const features = new KML().readFeatures(kml, {
                featureProjection: layer.projection,
            })
            features.forEach((olFeature) => {
                EditableFeature.deserialize(olFeature, this.availableIconSets)
            })
            this.drawingLayer.getSource().addFeatures(features)
            this.setDrawingFeatures(features.map((feature) => feature.getId()))
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
