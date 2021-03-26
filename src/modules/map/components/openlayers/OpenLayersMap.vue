<template>
    <!-- preventing right click (or long left click) to trigger the contextual menu of the browser-->
    <div id="ol-map" ref="map" oncontextmenu="return false">
        <div id="scale-line" ref="scaleLine" />
        <!-- Adding background layer -->
        <OpenLayersBODLayer
            v-if="currentBackgroundLayer"
            :layer-config="currentBackgroundLayer"
            :z-index="0"
        />
        <!-- Adding all other BOD layers -->
        <OpenLayersBODLayer
            v-for="(layer, index) in visibleLayers"
            :key="layer.id"
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

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import 'src/scss/variables';
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
    z-index: $zindex-map;

    .ol-scale-line {
        text-align: center;
        font-weight: bold;
        bottom: 0;
        left: 0;
        background: rgba(255, 255, 255, 0.6);
        .ol-scale-line-inner {
            color: $black;
            border: 2px solid $black;
            border-top: none;
        }
    }
}
</style>

<script>
import 'ol/ol.css'

import moment from 'moment'

import { mapState, mapGetters, mapActions } from 'vuex'
import { Map, View } from 'ol'
import ScaleLine from 'ol/control/ScaleLine'

import { round } from '@/utils/numberUtils'
import OpenLayersMarker, { markerStyles } from './OpenLayersMarker'
import OpenLayersAccuracyCircle from './OpenLayersAccuracyCircle'
import OpenLayersBODLayer from './OpenLayersBODLayer'
import OpenLayersHighlightedFeature from './OpenLayersHighlightedFeature'
import { ClickInfo } from '@/modules/map/store/map.store'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { Feature } from '@/api/features.api'
import log from '@/utils/logging'

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
        OpenLayersHighlightedFeature,
        OpenLayersBODLayer,
        OpenLayersAccuracyCircle,
        OpenLayersMarker,
    },
    data: () => {
        return {
            // we build the OL instance right away as it is required for "provide" below (otherwise children components will receive a null instance and won't ask for another one later on)
            map: new Map({ target: 'ol-map', controls: [] }),
            view: null,
            // exposing marker styles to the template
            markerStyles,
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
        }),
        ...mapGetters(['visibleLayers', 'currentBackgroundLayer', 'extent', 'resolution']),
        // zIndex calculation conundrum...
        startingZIndexForVisibleLayers: function () {
            return this.currentBackgroundLayer ? 1 : 0
        },
        zIndexDroppedPinned: function () {
            return this.startingZIndexForVisibleLayers + this.visibleLayers.length
        },
        startingZIndexForHighlightedFeatures: function () {
            return this.zIndexDroppedPinned + (this.pinnedLocation ? 1 : 0)
        },
        zIndexAccuracyCircle: function () {
            return this.startingZIndexForHighlightedFeatures + this.highlightedFeatures.length
        },
        visibleGeoJsonLayers: function () {
            return this.visibleLayers.filter((layer) => layer.type === LayerTypes.GEOJSON)
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
    },
    mounted() {
        this.map.setTarget(this.$refs.map)
        // Setting up OL objects
        this.view = new View({
            center: this.center,
            zoom: this.zoom,
        })
        this.map.setView(this.view)

        // adding scale line
        const scaleLine = new ScaleLine({
            target: this.$refs.scaleLine,
        })
        this.map.addControl(scaleLine)

        // Click management
        let pointerDownStart = null
        let lastClickTimeLength = 0
        this.map.on('pointerdown', () => {
            pointerDownStart = moment()
        })
        // TODO: trigger a click after pointer is down at (roughly) the same spot for longer than 1sec (no need to wait for the user to stop the click)
        this.map.on('pointerup', () => {
            lastClickTimeLength = moment().diff(pointerDownStart)
            pointerDownStart = null
        })
        // using 'singleclick' event instead of 'click', otherwise a double click (for zooming) on mobile
        // will trigger two 'click' actions in a row
        this.map.on('singleclick', (e) => {
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
            this.click(new ClickInfo(e.coordinate, lastClickTimeLength, e.pixel, geoJsonFeatures))
        })
        this.map.on('pointerdrag', () => {
            if (!this.mapIsBeingDragged) this.mapStartBeingDragged()
        })
        this.map.on('moveend', () => {
            if (this.mapIsBeingDragged) this.mapStoppedBeingDragged()
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
    beforeDestroy() {
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
    },
    provide: function () {
        return {
            // sharing OL map object with children components
            getMap: () => this.map,
        }
    },
}
</script>
