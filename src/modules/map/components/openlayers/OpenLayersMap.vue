<template>
  <!-- preventing right click (or long left click) to trigger the contextual menu of the browser-->
  <div id="ol-map" ref="map" oncontextmenu="return false">
    <div id="scale-line" ref="scaleLine"></div>
    <!-- Adding background layer -->
    <OpenLayersBODLayer v-if="currentBackgroundLayer"
                        :layer-config="currentBackgroundLayer"
                        :z-index="0" />
    <!-- Adding all other BOD layers -->
    <OpenLayersBODLayer v-for="(layer, index) in visibleLayers"
                        :key="layer.id"
                        :layer-config="layer"
                        :z-index="index + (currentBackgroundLayer ? 1 : 0)" />
    <!-- Adding highlight marker-->
    <OpenLayersMarker v-if="highlightedFeature && highlightedFeature.type === 'location'"
                      :position="highlightedFeature.coordinate"
                      :marker-style="markerStyles.BALLOON" />
    <!-- Adding marker and accuracy circle for Geolocation -->
    <OpenLayersAccuracyCircle v-if="isMobile && geolocationActive"
                              :position="geolocationPosition"
                              :accuracy="geolocationAccuracy" />
    <OpenLayersMarker v-if="geolocationActive"
                      :position="geolocationPosition"
                      :marker-style="markerStyles.POSITION" />
  </div>
</template>

<style lang="scss">
@import "node_modules/bootstrap/scss/bootstrap";
#ol-map {
  width: 100%;
  height: 100%;
}
#scale-line {
  position: absolute;
  // placing Map Scale over the footer to free some map screen space
  bottom: 0;
  height: 1rem;
  width: 150px;
  // OL Map is at z-index 10
  z-index: 20;

  .ol-scale-line {
    text-align: center;
    font-weight: bold;
    bottom: 0;
    left: 0;
    background: rgba(255,255,255,0.6);
    .ol-scale-line-inner {
      color: $black;
      border: 2px solid $black;
      border-top: none;
    }
  }
}
</style>

<script>
import 'ol/ol.css';

import moment from "moment";

import {mapState, mapGetters, mapActions} from "vuex";
import {Map, View} from 'ol';
import ScaleLine from "ol/control/ScaleLine"
import { isMobile } from 'mobile-device-detect';

import { round } from "@/numberUtils";
import OpenLayersMarker, { markerStyles } from "./OpenLayersMarker";
import OpenLayersAccuracyCircle from "./OpenLayersAccuracyCircle";
import OpenLayersBODLayer from "./OpenLayersBODLayer";

export default {
  components: {OpenLayersBODLayer, OpenLayersAccuracyCircle, OpenLayersMarker},
  computed: {
    ...mapState({
      zoom: state => state.position.zoom,
      center: state => state.position.center,
      highlightedFeature: state => state.map.highlightedFeature,
      pinLocation: state => state.map.pinLocation,
      mapIsBeingDragged: state => state.map.isBeingDragged,
      geolocationActive: state => state.geolocation.active,
      geolocationPosition: state => state.geolocation.position,
      geolocationAccuracy: state => state.geolocation.accuracy,
    }),
    ...mapGetters(["visibleLayers", "currentBackgroundLayer", "extent"]),
  },
  watch: {
    center: function () {
      this.view.animate({
        center: this.center,
        duration: 250
      })
    },
    zoom: function () {
      this.view.animate({
        zoom: this.zoom,
        duration: 250
      })
    },
    data() {
        return {
            // exposing marker styles to the template
            markerStyles,
            /** Keeping trace of the starting center in order to place the cross hair */
            initialCenter: null,
            popoverCoordinates: [],
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
        // zIndex calculation conundrum...
        startingZIndexForVisibleLayers() {
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
                duration: 250,
            })
        },
        zoom() {
            this.view.animate({
                zoom: this.zoom,
                duration: 250,
            })
        },
        rotation() {
            this.view.animate({
                rotation: this.rotation,
                duration: 250,
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
        this.map = new Map({ controls: [] })

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
            if (UIModes.MENU_OPENED_THROUGH_BUTTON) {
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
            }
        },
    },
}
</script>
