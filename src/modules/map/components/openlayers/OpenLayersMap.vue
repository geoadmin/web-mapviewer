<template>
    <!-- preventing right click (or long left click) to trigger the contextual menu of the browser-->
    <div id="ol-map" ref="map" @contextmenu="onContextMenu">
        <!-- Adding background layer -->
        <OpenLayersInternalLayer
            v-if="currentBackgroundLayer"
            :layer-config="currentBackgroundLayer"
            :z-index="0"
        />
        <OpenLayersInternalLayer
            v-if="isBackgroundVectorTile && backgroundLayerOnTopOfVectorBackground"
            :key="backgroundLayerOnTopOfVectorBackground.getID()"
            :layer-config="backgroundLayerOnTopOfVectorBackground"
            :current-map-resolution="resolution"
            :z-index="1"
        />
        <!-- Adding all other layers -->
        <OpenLayersInternalLayer
            v-for="(layer, index) in visibleLayers"
            :key="layer.getID()"
            :layer-config="layer"
            :current-map-resolution="resolution"
            :z-index="index + startingZIndexForVisibleLayers"
        />
        <!-- Adding pinned location -->
        <OpenLayersMarker
            v-if="pinnedLocation"
            :position="pinnedLocation"
            :marker-style="markerStyles.BALLOON"
            :z-index="zIndexDroppedPinned"
        />
        <!-- Showing cross hair if needed-->
        <OpenLayersMarker
            v-if="crossHairStyle"
            :position="initialCenter"
            :marker-style="crossHairStyle"
            :z-index="zIndexCrossHair"
        />
        <!-- Adding highlighted features -->
        <OpenLayersHighlightedFeature
            v-for="(feature, index) in selectedFeatures"
            :key="feature.id"
            :feature="feature"
            :z-index="index + startingZIndexForHighlightedFeatures"
        />
        <OpenLayersPopover
            v-if="showFeaturesPopover"
            :coordinates="popoverCoordinates"
            authorize-print
            @close="clearAllSelectedFeatures"
        >
            <template #extra-buttons>
                <ButtonWithIcon
                    :button-font-awesome-icon="['fa', 'caret-down']"
                    small
                    data-cy="toggle-floating-off"
                    @click="toggleFloatingTooltip"
                />
            </template>
            <FeatureEdit v-if="editFeature" :feature="editFeature" />
            <FeatureList v-else direction="column" />
        </OpenLayersPopover>
        <!-- Adding marker and accuracy circle for Geolocation -->
        <OpenLayersAccuracyCircle
            v-if="geolocationActive"
            :position="geolocationPosition"
            :accuracy="geolocationAccuracy"
            :z-index="zIndexAccuracyCircle"
        />
        <OpenLayersMarker
            v-if="geolocationActive"
            :position="geolocationPosition"
            :marker-style="markerStyles.POSITION"
            :z-index="zIndexAccuracyCircle + 1"
        />
    </div>
    <!-- So that external modules can have access to the map instance through the provided 'getMap' -->
    <slot />
</template>

<script>
import { EditableFeatureTypes, LayerFeature } from '@/api/features.api'
import LayerTypes from '@/api/layers/LayerTypes.enum'

import { IS_TESTING_WITH_CYPRESS, VECTOR_TILES_STYLE_ID } from '@/config'
import FeatureEdit from '@/modules/infobox/components/FeatureEdit.vue'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import OpenLayersPopover from '@/modules/map/components/openlayers/OpenLayersPopover.vue'
import { ClickInfo, ClickType } from '@/store/modules/map.store'
import { CrossHairs } from '@/store/modules/position.store'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import log from '@/utils/logging'
import { round } from '@/utils/numberUtils'
import { Map, View } from 'ol'
import { platformModifierKeyOnly } from 'ol/events/condition'
import { defaults as getDefaultInteractions } from 'ol/interaction'
import DoubleClickZoomInteraction from 'ol/interaction/DoubleClickZoom'
import DragRotateInteraction from 'ol/interaction/DragRotate'

import 'ol/ol.css'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'

import { mapActions, mapGetters, mapState } from 'vuex'
import OpenLayersAccuracyCircle from './OpenLayersAccuracyCircle.vue'
import OpenLayersHighlightedFeature from './OpenLayersHighlightedFeature.vue'
import OpenLayersInternalLayer from './OpenLayersInternalLayer.vue'
import OpenLayersMarker, { markerStyles } from './OpenLayersMarker.vue'

/**
 * Main OpenLayers map component responsible for building the OL map instance and telling the view
 * where to look at. Will delegate other responsibilities to children components (such as layer
 * rendering, marker placement, etc...).
 *
 * This is the only component of the OL components constellation that must be aware of the store,
 * and pass down information about it through props.
 */
export default {
    components: {
        ButtonWithIcon,
        FeatureEdit,
        FeatureList,
        OpenLayersAccuracyCircle,
        OpenLayersHighlightedFeature,
        OpenLayersInternalLayer,
        OpenLayersMarker,
        OpenLayersPopover,
    },
    provide() {
        return {
            // sharing OL map object with children components
            getMap: () => this.map,
        }
    },
    data() {
        return {
            // exposing marker styles to the template
            markerStyles,
            /** Keeping trace of the starting center in order to place the cross hair */
            initialCenter: null,
            popoverCoordinates: [],
            animationDuration: IS_TESTING_WITH_CYPRESS ? 0 : 250,
        }
    },
    computed: {
        ...mapState({
            zoom: (state) => state.position.zoom,
            rotation: (state) => state.position.rotation,
            center: (state) => state.position.center,
            selectedFeatures: (state) => state.features.selectedFeatures,
            pinnedLocation: (state) => state.map.pinnedLocation,
            mapIsBeingDragged: (state) => state.map.isBeingDragged,
            geolocationActive: (state) => state.geolocation.active,
            geolocationPosition: (state) => state.geolocation.position,
            geolocationAccuracy: (state) => state.geolocation.accuracy,
            crossHair: (state) => state.position.crossHair,
            isFeatureTooltipInFooter: (state) => !state.ui.floatingTooltip,
            clickInfo: (state) => state.map.clickInfo,
        }),
        ...mapGetters([
            'visibleLayers',
            'currentBackgroundLayer',
            'extent',
            'resolution',
            'isCurrentlyDrawing',
            'backgroundLayers',
        ]),
        crossHairStyle() {
            if (this.crossHair) {
                switch (this.crossHair) {
                    case CrossHairs.point:
                        return this.markerStyles.POINT
                    case CrossHairs.cross:
                        return this.markerStyles.CROSS
                    case CrossHairs.bowl:
                        return this.markerStyles.BOWL
                    case CrossHairs.marker:
                        return this.markerStyles.BALLOON
                    case CrossHairs.circle:
                        return this.markerStyles.CIRCLE
                }
            }
            return null
        },
        isBackgroundVectorTile() {
            return (
                this.currentBackgroundLayer &&
                this.currentBackgroundLayer.type === LayerTypes.VECTOR
            )
        },
        backgroundLayerOnTopOfVectorBackground() {
            // we currently only have the case of a light base map vector tile background with our national map on top
            if (
                this.isBackgroundVectorTile &&
                this.currentBackgroundLayer.getID() === VECTOR_TILES_STYLE_ID
            ) {
                return this.backgroundLayers.find(
                    (layer) => layer.getID() === 'ch.swisstopo.pixelkarte-farbe'
                )
            }
            return null
        },
        // zIndex calculation conundrum...
        startingZIndexForVisibleLayers() {
            // checking if the BG layer is a vector layer that has anoter
            if (this.isBackgroundVectorTile && this.backgroundLayerOnTopOfVectorBackground) {
                return 2
            }
            return this.currentBackgroundLayer ? 1 : 0
        },
        zIndexDroppedPinned() {
            return this.startingZIndexForVisibleLayers + this.visibleLayers.length
        },
        zIndexCrossHair() {
            return this.zIndexDroppedPinned + (this.pinnedLocation ? 1 : 0)
        },
        startingZIndexForHighlightedFeatures() {
            return this.zIndexCrossHair + (this.crossHairStyle ? 1 : 0)
        },
        zIndexAccuracyCircle() {
            return this.startingZIndexForHighlightedFeatures + this.selectedFeatures.length
        },
        visibleGeoJsonLayers() {
            return this.visibleLayers.filter((layer) => layer.type === LayerTypes.GEOJSON)
        },
        showFeaturesPopover() {
            if (this.isFeatureTooltipInFooter || this.selectedFeatures.length === 0) {
                return false
            }
            const [firstFeature] = this.selectedFeatures
            return (
                // We hide the popover whenever the feature is being dragged ...
                !firstFeature.isDragged &&
                // ... and we never show the measure feature in the popover.
                firstFeature.featureType !== EditableFeatureTypes.MEASURE
            )
        },
        editFeature() {
            return this.selectedFeatures.find((feature) => feature.isEditable)
        },
    },
    // let's watch changes for center and zoom, and animate what has changed with a small easing
    watch: {
        center() {
            this.view.animate({
                center: this.center,
                duration: this.animationDuration,
            })
        },
        zoom() {
            this.view.animate({
                zoom: this.zoom,
                duration: this.animationDuration,
            })
        },
        rotation() {
            this.view.animate({
                rotation: this.rotation,
                duration: this.animationDuration,
            })
        },
        isCurrentlyDrawing(newValue) {
            // we iterate through the map "interaction" classes in order
            // to enable/disable the "double click zoom" interaction while
            // a drawing is currently made (otherwise, when the user double
            // clicks to finish his/her drawing, the map is zooming)
            this.map.getInteractions().forEach((interaction) => {
                if (interaction instanceof DoubleClickZoomInteraction) {
                    interaction.setActive(!newValue)
                }
            })
        },
        selectedFeatures: {
            // we need to deep watch this as otherwise we aren't triggered when
            // coordinates are changed (but only when one feature is added/removed)
            handler(newSelectedFeatures) {
                if (newSelectedFeatures.length > 0) {
                    const [firstFeature] = newSelectedFeatures
                    this.popoverCoordinates = Array.isArray(firstFeature.coordinates[0])
                        ? firstFeature.coordinates[firstFeature.coordinates.length - 1]
                        : firstFeature.coordinates
                }
            },
            deep: true,
        },
    },
    beforeCreate() {
        // we build the OL instance right away as it is required for "provide" below (otherwise
        // children components will receive a null instance and won't ask for another one later on)

        /* Make it possible to rotate the map with ctrl+drag (in addition to openlayers default
        Alt+Shift+Drag). This is probably more intuitive. Also, Windows and some Linux distros use
        alt+shift to switch the keyboard layout, so using alt+shift may have unintended side effects
        or not work at all. */
        const interactions = getDefaultInteractions().extend([
            new DragRotateInteraction({
                condition: platformModifierKeyOnly,
            }),
        ])
        this.map = new Map({ controls: [], interactions })

        if (IS_TESTING_WITH_CYPRESS) {
            window.map = this.map
        }
    },
    created() {
        this.initialCenter = [...this.center]
    },
    mounted() {
        // register any custom projection in OpenLayers
        register(proj4)
        this.map.setTarget(this.$refs.map)
        // Setting up OL objects
        this.view = new View({
            center: this.center,
            zoom: this.zoom,
            rotation: this.rotation,
        })
        this.map.setView(this.view)

        // Click management
        this.map.on('pointerdown', this.onMapPointerDown)
        // TODO: trigger a click after pointer is down at (roughly) the same spot
        // for longer than 1sec (no need to wait for the user to stop the click)
        this.map.on('pointerup', this.onMapPointerUp)
        // using 'singleclick' event instead of 'click', otherwise a double click
        // (for zooming) on mobile will trigger two 'click' actions in a row
        this.map.on('singleclick', this.onMapSingleClick)
        this.map.on('pointerdrag', this.onMapPointerDrag)
        this.map.on('moveend', this.onMapMoveEnd)
    },
    unmounted() {
        this.map.un('pointerdown', this.onMapPointerDown)
        this.map.un('pointerup', this.onMapPointerUp)
        this.map.un('singleclick', this.onMapSingleClick)
        this.map.un('pointerdrag', this.onMapPointerDrag)
        this.map.un('moveend', this.onMapMoveEnd)
        this.map.setTarget(null)
        this.map.setView(null)

        delete this.map
        delete this.view
    },
    methods: {
        ...mapActions([
            'setCenter',
            'setZoom',
            'setRotation',
            'click',
            'mapStoppedBeingDragged',
            'mapStartBeingDragged',
            'toggleFloatingTooltip',
            'clearAllSelectedFeatures',
        ]),
        onMapPointerDown() {
            this.pointerDownStart = performance.now()
        },
        onMapPointerUp() {
            this.lastClickTimeLength = performance.now() - this.pointerDownStart
            this.pointerDownStart = null
        },
        onMapSingleClick(event) {
            // if no drawing is currently made
            if (!this.isCurrentlyDrawing) {
                const geoJsonFeatures = []
                // if there is a GeoJSON layer currently visible, we will find it and search for features under the mouse cursor
                this.visibleGeoJsonLayers.forEach((geoJsonLayer) => {
                    // retrieving OpenLayers layer object for this layer
                    const olLayer = this.map
                        .getLayers()
                        .getArray()
                        .find((layer) => layer.get('id') === geoJsonLayer.getID())
                    if (olLayer) {
                        // looking at features for this specific layer under the mouse cursor
                        this.map
                            .getFeaturesAtPixel(event.pixel, {
                                // filtering other layers out
                                layerFilter: (layer) => layer.get('id') === geoJsonLayer.id,
                            })
                            .forEach((feature) => {
                                const featureGeometry = feature.getGeometry()
                                // for GeoJSON features, there's a catch as they only provide us with the inner tooltip content
                                // we have to wrap it around the "usual" wrapper from the backend
                                // (not very fancy but otherwise the look and feel is different from a typical backend tooltip)
                                const geoJsonFeature = new LayerFeature(
                                    geoJsonLayer,
                                    feature.get('id') || feature.getId(),
                                    `<div class="htmlpopup-container">
                                        <div class="htmlpopup-header">
                                            <span>${geoJsonLayer.name}</span>
                                        </div>
                                        <div class="htmlpopup-content">
                                            ${feature.get('description')}
                                        </div>
                                    </div>`,
                                    featureGeometry.flatCoordinates,
                                    featureGeometry.getExtent()
                                )
                                log.debug('GeoJSON feature found', geoJsonFeature)
                                geoJsonFeatures.push(geoJsonFeature)
                            })
                    }
                })
                // publishing click event into the store
                this.click(
                    new ClickInfo(
                        event.coordinate,
                        this.lastClickTimeLength,
                        event.pixel,
                        geoJsonFeatures
                    )
                )
            }
        },
        onMapPointerDrag() {
            if (!this.mapIsBeingDragged) {
                this.mapStartBeingDragged()
            }
        },
        onMapMoveEnd() {
            if (this.mapIsBeingDragged) {
                this.mapStoppedBeingDragged()
            }
            if (this.view) {
                const [x, y] = this.view.getCenter()
                if (x !== this.center[0] || y !== this.center[1]) {
                    this.setCenter({ x, y })
                }
                const zoom = round(this.view.getZoom(), 3)
                if (zoom && zoom !== this.zoom) {
                    this.setZoom(zoom)
                }
                const rotation = this.view.getRotation()
                if (rotation !== this.rotation) {
                    this.setRotation(rotation)
                }
            }
        },
        onContextMenu(event) {
            const screenCoordinates = [event.x, event.y]
            this.click(
                new ClickInfo(
                    this.map.getCoordinateFromPixel(screenCoordinates),
                    0,
                    screenCoordinates,
                    [],
                    ClickType.RIGHT_CLICK
                )
            )
            // we do not want the contextual menu to shows up, so we prevent the event propagation
            event.preventDefault()
            return false
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

#ol-map {
    width: 100%;
    height: 100%;
    position: relative; // Element must be positioned to set a z-index
    z-index: $zindex-map;
}
</style>
