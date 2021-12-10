<template>
    <!-- preventing right click (or long left click) to trigger the contextual menu of the browser-->
    <div id="ol-map" ref="map" @contextmenu="showLocationPopup">
        <!-- So that external modules can have access to the map instance through the provided 'getMap' -->
        <slot />
        <portal to="footer" :order="1">
            <!--
                It is necessary to use `v-show` instead of `v-if`. Otherwise,
                the scale-line will never show if the initial zoom was too low.
            -->
            <div v-show="zoom >= 9" id="scale-line" ref="scaleLine" data-cy="scaleline" />
        </portal>
        <OpenLayersMousePosition v-if="isUIinDesktopMode" />
        <VisibleLayersCopyrights
            :layers="backgroundAndVisibleLayers"
            :is-footer-visible="isFooterVisible"
        />
        <!-- Adding background layer -->
        <OpenLayersInternalLayer
            v-if="currentBackgroundLayer"
            :layer-config="currentBackgroundLayer"
            :z-index="0"
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
            v-for="(feature, index) in highlightedFeatures"
            :key="`${index}-${feature.id}`"
            :feature="feature"
            :z-index="index + startingZIndexForHighlightedFeatures"
        />
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
</template>

<script>
import 'ol/ol.css'

import { mapState, mapGetters, mapActions } from 'vuex'
import { Map, View } from 'ol'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import ScaleLine from 'ol/control/ScaleLine'
import DoubleClickZoomInteraction from 'ol/interaction/DoubleClickZoom'

import { round } from '@/utils/numberUtils'
import OpenLayersMarker, { markerStyles } from './OpenLayersMarker.vue'
import OpenLayersAccuracyCircle from './OpenLayersAccuracyCircle.vue'
import OpenLayersInternalLayer from './OpenLayersInternalLayer.vue'
import OpenLayersHighlightedFeature from './OpenLayersHighlightedFeature.vue'
import { ClickInfo, ClickType } from '@/modules/map/store/map.store'
import { UIModes } from '@/modules/store/modules/ui.store'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { Feature } from '@/api/features.api'
import log from '@/utils/logging'
import OpenLayersMousePosition from '@/modules/map/components/openlayers/OpenLayersMousePosition.vue'
import VisibleLayersCopyrights from '@/modules/map/components/openlayers/VisibleLayersCopyrights.vue'
import { CrossHairs } from '@/modules/store/modules/position.store'

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
        VisibleLayersCopyrights,
        OpenLayersMousePosition,
        OpenLayersHighlightedFeature,
        OpenLayersInternalLayer,
        OpenLayersAccuracyCircle,
        OpenLayersMarker,
    },
    provide: function () {
        return {
            // sharing OL map object with children components
            getMap: () => this.map,
        }
    },
    data: () => {
        return {
            // exposing marker styles to the template
            markerStyles,
            /** Keeping trace of the starting center in order to place the cross hair */
            initialCenter: null,
        }
    },
    computed: {
        ...mapState({
            zoom: (state) => state.position.zoom,
            center: (state) => state.position.center,
            highlightedFeatures: (state) => state.map.highlightedFeatures,
            pinnedLocation: (state) => state.map.pinnedLocation,
            mapIsBeingDragged: (state) => state.map.isBeingDragged,
            geolocationActive: (state) => state.geolocation.active,
            geolocationPosition: (state) => state.geolocation.position,
            geolocationAccuracy: (state) => state.geolocation.accuracy,
            crossHair: (state) => state.position.crossHair,
            uiMode: (state) => state.ui.mode,
            isFooterVisible: (state) => !state.ui.fullscreenMode,
        }),
        ...mapGetters([
            'visibleLayers',
            'currentBackgroundLayer',
            'extent',
            'resolution',
            'isCurrentlyDrawing',
        ]),
        crossHairStyle: function () {
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
        startingZIndexForVisibleLayers: function () {
            return this.currentBackgroundLayer ? 1 : 0
        },
        zIndexDroppedPinned: function () {
            return this.startingZIndexForVisibleLayers + this.visibleLayers.length
        },
        zIndexCrossHair: function () {
            return this.zIndexDroppedPinned + (this.pinnedLocation ? 1 : 0)
        },
        startingZIndexForHighlightedFeatures: function () {
            return this.zIndexCrossHair + (this.crossHairStyle ? 1 : 0)
        },
        zIndexAccuracyCircle: function () {
            return this.startingZIndexForHighlightedFeatures + this.highlightedFeatures.length
        },
        visibleGeoJsonLayers: function () {
            return this.visibleLayers.filter((layer) => layer.type === LayerTypes.GEOJSON)
        },
        backgroundAndVisibleLayers: function () {
            const layers = []
            if (this.currentBackgroundLayer) {
                layers.push(this.currentBackgroundLayer)
            }
            if (this.visibleLayers.length > 0) {
                layers.push(...this.visibleLayers)
            }
            return layers
        },
        isUIinDesktopMode: function () {
            return this.uiMode === UIModes.MENU_ALWAYS_OPEN
        },
    },
    // let's watch changes for center and zoom, and animate what has changed with a small easing
    watch: {
        center: function () {
            this.view.animate({
                center: this.center,
                duration: 250,
            })
        },
        zoom: function () {
            this.view.animate({
                zoom: this.zoom,
                duration: 250,
            })
        },
        isCurrentlyDrawing: function (newValue) {
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
    },
    beforeCreate() {
        // we build the OL instance right away as it is required for "provide" below (otherwise
        // children components will receive a null instance and won't ask for another one later on)
        this.map = new Map({ controls: [] })
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
        })
        this.map.setView(this.view)

        // adding scale line
        // see https://portal-vue.linusb.org/guide/caveats.html#refs
        // for the reason this double $nextTick is here
        this.$nextTick().then(() => {
            this.$nextTick(() => {
                const scaleLine = new ScaleLine({
                    target: this.$refs.scaleLine,
                    className: 'scale-line',
                })
                this.map.addControl(scaleLine)
            })
        })

        // Click management
        let pointerDownStart = null
        let lastClickTimeLength = 0
        this.map.on('pointerdown', () => {
            pointerDownStart = performance.now()
        })
        // TODO: trigger a click after pointer is down at (roughly) the same spot for longer than 1sec (no need to wait for the user to stop the click)
        this.map.on('pointerup', () => {
            lastClickTimeLength = performance.now() - pointerDownStart
            pointerDownStart = null
        })
        // using 'singleclick' event instead of 'click', otherwise a double click (for zooming) on mobile
        // will trigger two 'click' actions in a row
        this.map.on('singleclick', (e) => {
            // if no drawing is currently made
            if (!this.isCurrentlyDrawing) {
                const geoJsonFeatures = []
                // if there is a GeoJSON layer currently visible, we will find it and search for features under the mouse cursor
                this.visibleGeoJsonLayers.forEach((geoJsonLayer) => {
                    // retrieving OpenLayers layer object for this layer
                    const olLayer = this.map
                        .getLayers()
                        .getArray()
                        .find((layer) => layer.get('id') === geoJsonLayer.id)
                    if (olLayer) {
                        // looking at features for this specific layer under the mouse cursor
                        this.map
                            .getFeaturesAtPixel(e.pixel, {
                                // filtering other layers out
                                layerFilter: (layer) => layer.get('id') === geoJsonLayer.id,
                            })
                            .forEach((feature) => {
                                const featureGeometry = feature.getGeometry()
                                // for GeoJSON features, there's a catch as they only provide us with the inner tooltip content
                                // we have to wrap it around the "usual" wrapper from the backend
                                // (not very fancy but otherwise the look and feel is different from a typical backend tooltip)
                                const geoJsonFeature = new Feature(
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
                                log('debug', 'GeoJSON feature found', geoJsonFeature)
                                geoJsonFeatures.push(geoJsonFeature)
                            })
                    }
                })
                // publishing click event into the store
                this.click(
                    new ClickInfo(e.coordinate, lastClickTimeLength, e.pixel, geoJsonFeatures)
                )
            }
        })
        this.map.on('pointerdrag', () => {
            if (!this.mapIsBeingDragged) {
                this.mapStartBeingDragged()
            }
        })
        this.map.on('moveend', () => {
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
            }
        })
    },
    beforeUnmount() {
        this.map = null
        this.view = null
    },
    methods: {
        ...mapActions([
            'setCenter',
            'setZoom',
            'click',
            'mapStoppedBeingDragged',
            'mapStartBeingDragged',
        ]),
        showLocationPopup: function (e) {
            const screenCoordinates = [e.x, e.y]
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
            e.preventDefault()
            return false
        },
    },
}
</script>

<style lang="scss">
@import 'src/scss/webmapviewer-bootstrap-theme';
// style is unscoped so that it may reach scale-line outside of itself
// as it was transported in the footer by vue-portal
#ol-map {
    width: 100%;
    height: 100%;
}
#scale-line {
    // placing Map Scale over the footer to free some map screen space
    height: 1rem;
    width: 150px;

    .scale-line {
        text-align: center;
        font-weight: bold;
        bottom: 0;
        left: 0;
        background: rgba(255, 255, 255, 0.6);
        .scale-line-inner {
            color: $black;
            border: 2px solid $black;
            border-top: none;
            max-width: 150px;
        }
    }
}
</style>
