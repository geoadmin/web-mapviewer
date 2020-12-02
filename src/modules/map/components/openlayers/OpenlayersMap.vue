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
    <!-- Adding highlight marker and pinned location -->
    <OpenLayersMarker v-if="highlightedFeature && highlightedFeature.type === 'location'"
                      :position="highlightedFeature.coordinate"
                      :marker-style="markerStyles.BALLOON" />
    <OpenLayersMarker v-if="pinnedLocation"
                      :position="pinnedLocation"
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

import { round } from "@/utils/numberUtils";
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
      pinnedLocation: state => state.map.pinnedLocation,
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
  },
  mounted() {
    this.map.setTarget(this.$refs.map);
    // Setting up OL objects
    this.view = new View({
      center: this.center,
      zoom: this.zoom,
    });
    this.map.setView(this.view);

    // adding scale line
    const scaleLine = new ScaleLine({
      target: this.$refs.scaleLine
    })
    this.map.addControl(scaleLine);

    // Click management
    let pointerDownStart = null;
    let lastClickTimeLength = 0;
    this.map.on('pointerdown', () => {
      pointerDownStart = moment();
    });
    this.map.on('pointerup', () => {
      lastClickTimeLength = moment().diff(pointerDownStart);
      pointerDownStart = null;
    });
    // using 'singleclick' event instead of 'click', otherwise a double click (for zooming) on mobile
    // will trigger a double 'click' action
    this.map.on('singleclick', (e) => {
      this.click({
        coordinate: e.coordinate,
        millisecondsSpentMouseDown: lastClickTimeLength
      })
    })
    this.map.on('pointerdrag', () => {
      if (!this.mapIsBeingDragged) this.mapStartBeingDragged();
    })
    this.map.on('moveend', () => {
      if (this.mapIsBeingDragged) this.mapStoppedBeingDragged();
      if (this.view) {
        const [x, y] = this.view.getCenter();
        if (x !== this.center[0] || y !== this.center[1]) {
          this.setCenter({x, y});
        }
        const zoom = round(this.view.getZoom(), 3);
        if (zoom && zoom !== this.zoom) {
          this.setZoom(zoom);
        }
      }
    })
  },
  beforeDestroy() {
    this.map = null;
    this.view = null;
  },
  methods: {
    ...mapActions(["setCenter", "setExtent", "setZoom", "click", 'mapStoppedBeingDragged', 'mapStartBeingDragged']),
  },
  data: () => {
    return {
      map: new Map({ target: 'ol-map', controls: [] }),
      view: null,
      markerStyles,
      isMobile
    }
  },
  provide: function () {
    return {
      getMap: () => this.map
    }
  }
};
</script>
