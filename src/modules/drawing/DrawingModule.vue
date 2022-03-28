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
            @delete-last-point="deleteLastPoint"
        />
        <DrawingTooltip
            v-if="show"
            :current-drawing-mode="currentDrawingMode"
            :currently-edited-feature="currentlyEditedFeature"
        />
        <teleport v-if="readyForTeleport" to="#map-footer-middle">
            <ProfilePopup
                :feature="currentlyEditedFeature"
                :ui-mode="uiMode"
                @delete="deleteSelectedFeature"
                @close="clearAllSelectedFeatures"
            />
        </teleport>
    </div>
</template>

<script>
import { EditableFeature } from '@/api/features.api'
import { createKml, updateKml } from '@/api/files.api'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox.vue'
import DrawingTooltip from '@/modules/drawing/components/DrawingTooltip.vue'
import ProfilePopup from '@/modules/drawing/components/ProfilePopup.vue'
import drawingConfig from '@/modules/drawing/lib/drawingConfig'
import { generateKmlString } from '@/modules/drawing/lib/export-utils'
import MeasureManager from '@/modules/drawing/lib/MeasureManager'
import { editingFeatureStyleFunction, featureStyle } from '@/modules/drawing/lib/style'
import { DrawingModes } from '@/modules/store/modules/drawing.store'
import { noModifierKeys, singleClick } from 'ol/events/condition'
import { LineString } from 'ol/geom'
import GeometryType from 'ol/geom/GeometryType'
import DrawInteraction from 'ol/interaction/Draw'
import ModifyInteraction from 'ol/interaction/Modify'
import SelectInteraction from 'ol/interaction/Select'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { getUid } from 'ol/util'
import { mapActions, mapState } from 'vuex'

// const cursorPointerClass = 'cursor-pointer'
// const cursorGrabClass = 'cursor-grab'
const cursorGrabbingClass = 'cursor-grabbing'

export default {
    components: { DrawingTooltip, DrawingToolbox, ProfilePopup },
    inject: ['getMap'],
    provide() {
        return {
            // sharing OL stuff for children drawing components
            getDrawingLayer: () => this.drawingLayer,
            getSelectInteraction: () => this.selectInteraction,
            getModifyInteraction: () => this.modifyInteraction,
        }
    },
    data() {
        return {
            currentlyEditedFeature: null,
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
    },
    watch: {
        show(show) {
            if (show) {
                this.addSavedKmlLayer()
                this.activateDrawing()
                // if icons have not yet been loaded, we do so
                if (this.availableIconSets.length === 0) {
                    this.loadAvailableIconSets()
                }
            } else {
                this.disableDrawing()
            }
        },
        currentDrawingMode(newDrawingMode) {
            // switching interaction (or activating one if there was none yet)
            if (this.currentDrawingInteraction) {
                this.currentDrawingInteraction.setActive(false)
            }
            if (newDrawingMode in DrawingModes) {
                this.currentDrawingInteraction = this.interactionByDrawingMode[newDrawingMode]
                this.currentDrawingInteraction.setActive(true)
            } else {
                this.currentDrawingInteraction = null
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
        currentlyEditedFeature(newSelectedFeature) {
            this.selectInteraction.getFeatures().clear()
            if (newSelectedFeature) {
                // creating an editable feature with all the data from the drawing overlay
                const featureForStore = new EditableFeature(
                    `drawing_feature_${newSelectedFeature.getId()}`,
                    this.extractFeatureCoordinates(newSelectedFeature),
                    newSelectedFeature.get('text'),
                    newSelectedFeature.get('description'),
                    newSelectedFeature.get('drawingMode'),
                    newSelectedFeature.get('textColor'),
                    newSelectedFeature.get('textSize'),
                    newSelectedFeature.get('fillColor'),
                    newSelectedFeature.get('icon'),
                    newSelectedFeature.get('iconSize')
                )
                // binding store feature change events to our handlers
                this.bindFeatureEvents(featureForStore)
                this.setSelectedFeatures([featureForStore])
                this.selectInteraction.getFeatures().push(newSelectedFeature)
            }
        },
        selectedFeatures(newSelectedFeatures) {
            // if the store doesn't contain any more feature, we clear our local variable on that topic
            if (!newSelectedFeatures || newSelectedFeatures.length === 0) {
                this.currentlyEditedFeature = null
            }
        },
    },
    created() {
        this.drawingLayer = new VectorLayer({
            source: new VectorSource({ useSpatialIndex: false }),
            style: editingFeatureStyleFunction,
        })
        this.selectInteraction = new SelectInteraction({
            style: editingFeatureStyleFunction,
            toggleCondition: () => false,
            layers: [this.drawingLayer],
        })
        const selected = this.selectInteraction.getFeatures()
        selected.on('add', this.onSelectChange)
        selected.on('remove', this.onSelectChange)
        this.modifyInteraction = new ModifyInteraction({
            features: selected,
            style: editingFeatureStyleFunction,
            deleteCondition: (event) => noModifierKeys(event) && singleClick(event),
            // We need to consider the visible shape here as it is also considered
            // by ol/Map#forEachFeatureAtPixel which we use to display to tooltip.
            hitDetection: true,
        })
        this.modifyInteraction.on('modifystart', this.onModifyStart)
        this.modifyInteraction.on('modifyend', this.onModifyEnd)

        this.interactionByDrawingMode = {}

        for (const config of drawingConfig) {
            const interaction = new DrawInteraction({
                style: editingFeatureStyleFunction,
                type: config.geomType,
                source: this.drawingLayer.getSource(),
            })
            interaction.setActive(false)
            interaction.set('drawingMode', config.drawingMode)
            interaction
                .getOverlay()
                .getSource()
                .on('addfeature', (event) =>
                    this.onAddFeature(event, config.geomType, config.drawingMode, config.properties)
                )
            interaction.on('drawstart', (event) => this.onDrawStart(event))
            interaction.on('drawend', (event) => this.onDrawEnd(event, interaction))
            this.interactionByDrawingMode[config.drawingMode] = interaction
        }

        const map = this.getMap()
        this.measureManager = new MeasureManager(map, this.drawingLayer)
    },
    mounted() {
        // if we are testing with Cypress, we expose the map (so that it's easier
        // to simulate events to draw on it)
        if (IS_TESTING_WITH_CYPRESS) {
            window.drawingManager = this.manager
        }

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
        deleteLastPoint() {
            if (
                this.currentDrawingMode === DrawingModes.MEASURE ||
                this.currentDrawingMode === DrawingModes.LINEPOLYGON
            ) {
                this.interactionByDrawingMode[this.currentDrawingMode].removeLastPoint()
                this.onChange()
            }
        },
        triggerKMLUpdate() {
            if (this.KMLUpdateTimeout) {
                clearTimeout(this.KMLUpdateTimeout)
                this.KMLUpdateTimeout = 0
            }
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
        onSelectChange(event) {
            if (event.type === 'add') {
                this.currentlyEditedFeature = event.element
            } else if (event.type === 'remove') {
                this.currentlyEditedFeature = null
                // This property is never set to false internally. This is a problem
                // with markers when we switch directly from one feature to the next.
                this.modifyInteraction.snappedToVertex_ = false
            }
        },
        onModifyStart(event) {
            const features = event.features.getArray()
            const [feature] = features
            if (feature) {
                const correspondingStoreFeature =
                    this.getStoreFeatureCorrespondingToOpenLayersFeature(feature)
                if (correspondingStoreFeature) {
                    this.changeFeatureIsDragged({
                        feature: correspondingStoreFeature,
                        isDragged: true,
                    })
                }
                this.getMap().getTarget().classList.add(cursorGrabbingClass)
            }
        },
        onModifyEnd(event) {
            if (!event.features) {
                return
            }
            const features = event.features.getArray()
            const [feature] = features
            if (feature) {
                const correspondingStoreFeature =
                    this.getStoreFeatureCorrespondingToOpenLayersFeature(feature)
                if (correspondingStoreFeature) {
                    this.changeFeatureIsDragged({
                        feature: correspondingStoreFeature,
                        isDragged: false,
                    })
                    this.changeFeatureCoordinates({
                        feature: correspondingStoreFeature,
                        coordinates: this.extractFeatureCoordinates(feature),
                    })
                }
                this.getMap().getTarget().classList.remove(cursorGrabbingClass)
                this.onChange()
            }
        },
        onAddFeature(event, geometryType, drawingMode, properties) {
            const feature = event.feature
            const props =
                typeof properties === 'function' ? properties(this.availableIconSets) : properties

            feature.setId(getUid(feature))
            feature.setProperties({
                type: geometryType,
                drawingMode,
                ...props,
            })
        },
        onDrawStart(event) {
            event.feature.set('isDrawing', true)
            if (event.target.get('drawingMode') === DrawingModes.MEASURE) {
                this.measureManager.addOverlays(event.feature)
            }
        },
        onDrawEnd(event, interaction) {
            const feature = event.feature
            feature.unset('isDrawing')
            feature.setStyle(featureStyle)
            this.drawingLayer.getSource().once('addfeature', (event) => {
                // checking if last point is the same as the first, if not so, we transform the polygon into a linestring
                if (feature.get('type') === 'Polygon') {
                    const coordinates = feature.getGeometry().getLinearRing().getCoordinates()
                    if (coordinates.length > 1) {
                        const firstPoint = coordinates[0]
                        const lastPoint = coordinates[coordinates.length - 1]
                        if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
                            // if not the same ending point, it is not a polygon (the user didn't finish drawing by closing it)
                            // so we transform the drawn polygon into a linestring
                            feature.setGeometry(new LineString(coordinates))
                        }
                    }
                }
                if (event.feature.get('drawingMode') === DrawingModes.MEASURE) {
                    this.measureManager.addOverlays(event.feature)
                }
                this.onChange(event.feature)
            })

            // deactivate drawing tool
            interaction.setActive(false)
            this.sketchPoints = 0

            // remove the area tooltip.
            this.measureManager.removeOverlays(feature)
            this.currentlyEditedFeature = feature

            // de-selecting the current tool (drawing mode)
            this.setDrawingMode(null)
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
            this.selectInteraction.getFeatures().clear()
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
        /** Transform a Polygon to a LineString if the geometry was not closed by a click on the first point */
        polygonToLineString(feature) {
            const geometry = feature.getGeometry()
            if (geometry.getType() === GeometryType.POLYGON) {
                const coordinates = geometry.getLinearRing().getCoordinates()
                coordinates.pop()
                feature.setGeometry(new LineString(coordinates))
            }
        },
        activateDrawing() {
            this.selectInteraction.setActive(true)
            this.modifyInteraction.setActive(true)
            const map = this.getMap()
            if (map) {
                map.addInteraction(this.selectInteraction)
                map.addInteraction(this.modifyInteraction)
                for (const interaction of Object.values(this.interactionByDrawingMode)) {
                    map.addInteraction(interaction)
                }
                map.addLayer(this.drawingLayer)
            }
        },
        disableDrawing() {
            this.selectInteraction.setActive(false)
            this.modifyInteraction.setActive(false)
            const map = this.getMap()
            if (map) {
                map.removeLayer(this.drawingLayer)
                for (const interaction of Object.values(this.interactionByDrawingMode)) {
                    map.removeInteraction(interaction)
                }
                map.removeInteraction(this.modifyInteraction)
                map.removeInteraction(this.selectInteraction)
            }
            // this.manager.deactivate()
        },
        //----------------------------------------------------------------------
        // Bindings between the currently edited feature and the one stored in Vuex
        //----------------------------------------------------------------------
        bindFeatureEvents(feature) {
            if (feature) {
                feature.on('change:title', this.updateFeatureTitle)
                feature.on('change:description', this.updateFeatureDescription)
                feature.on('change:textColor', this.updateFeatureTextColor)
                feature.on('change:textSize', this.updateFeatureTextSize)
                feature.on('change:fillColor', this.updateFeatureFillColor)
                feature.on('change:fillColor', this.updateFeatureIcon)
                feature.on('change:icon', this.updateFeatureIcon)
                feature.on('change:iconSize', this.updateFeatureIcon)
            }
        },
        unbindFeatureEvents(feature) {
            if (feature) {
                feature.removeListener('change:title', this.updateFeatureTitle)
                feature.removeListener('change:description', this.updateFeatureDescription)
                feature.removeListener('change:textColor', this.updateFeatureTextColor)
                feature.removeListener('change:textSize', this.updateFeatureTextSize)
                feature.removeListener('change:fillColor', this.updateFeatureFillColor)
                feature.removeListener('change:fillColor', this.updateFeatureIcon)
                feature.removeListener('change:icon', this.updateFeatureIcon)
                feature.removeListener('change:iconSize', this.updateFeatureIcon)
            }
        },
        updateFeatureTitle(feature) {
            this.currentlyEditedFeature?.set('text', feature.title)
        },
        updateFeatureDescription(feature) {
            this.currentlyEditedFeature?.set('description', feature.description)
        },
        updateFeatureTextColor(feature) {
            this.currentlyEditedFeature?.set('color', feature.textColor.fill)
            this.currentlyEditedFeature?.set('strokeColor', feature.textColor.border)
        },
        updateFeatureTextSize(feature) {
            this.currentlyEditedFeature?.set('font', feature.textSize.font)
            this.currentlyEditedFeature?.set('textScale', feature.textSizeScale)
        },
        updateFeatureFillColor(feature) {
            this.currentlyEditedFeature?.set('color', feature.fillColor.fill)
        },
        updateFeatureIcon(feature) {
            this.currentlyEditedFeature?.set('iconUrl', feature.iconUrl)
        },
        getStoreFeatureCorrespondingToOpenLayersFeature(openLayersFeature) {
            return this.selectedFeatures.find(
                (feature) => feature.id === `drawing_feature_${openLayersFeature.getId()}`
            )
        },
        extractFeatureCoordinates(feature) {
            let coordinates = feature.getGeometry().getCoordinates()
            if (feature.getGeometry().getType() === GeometryType.POLYGON) {
                // in case of a polygon, the coordinates structure is
                // [
                //   [ (poly1)
                //      [coord1],[coord2]
                //   ],
                //   [ (poly2) ...
                // ]
                // so as we will not have multipoly, we only keep what's defined as poly one
                // (we remove the wrapping array that would enable us to have a second polygon)
                coordinates = coordinates[0]
            }
            return coordinates
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
