<template>
  <div id="maplibre-map">
    <MaplibreBODLayer v-for="(layer, index) in visibleLayers"
                      :key="layer.id"
                      :layer-config="layer"
                      :z-index="index + (currentBackgroundLayer ? 1 : 0)" />
  </div>
</template>

<style>
#maplibre-map {
  width: 100%;
  height: 100%;
}
</style>

<script>
import "maplibre-gl/dist/mapbox-gl.css";

import { Map } from "maplibre-gl";
import { mapState, mapGetters, mapActions } from "vuex";
import axios from "axios";
import proj4 from 'proj4';
import moment from "moment";
import { isMobile } from 'mobile-device-detect';

import { VECTOR_TILES_STYLE_URL } from "@/config";
import {round} from "@/numberUtils";
import MaplibreBODLayer from "./MaplibreBODLayer";

export default {
  components: {MaplibreBODLayer},
  data() {
    return {
      map: null,
      style: null,
      centerChangeTriggeredByMe: false,
    };
  },
  computed: {
    ...mapState({
      zoom: state => state.position.zoom - 1,
      pinLocation: state => state.map.pinLocation,
      geolocationActive: state => state.geolocation.active,
      geolocationPosition: state => state.geolocation.position,
      geolocationAccuracy: state => state.geolocation.accuracy,
    }),
    ...mapGetters(["centerEpsg4326", "visibleLayers", "currentBackgroundLayer", "extent"]),
  },
  mounted() {
    axios.get(VECTOR_TILES_STYLE_URL).then(response => {
      this.style = response.data;
      this.map = new Map({
        container: 'maplibre-map',
        style: this.style,
        center: this.centerEpsg4326,
        zoom: this.zoom,
      });

      // Click management
      let mouseDownEvent = 'mousedown';
      let mouseUpEvent = 'mouseup';
      if (isMobile) {
        mouseDownEvent = 'touchstart';
        mouseUpEvent = 'touchend';
      }
      let clickStartTimestamp = null;
      let lastClickDuration = 0;
      this.map.on(mouseDownEvent, () => {
        clickStartTimestamp = moment();
      });
      this.map.on(mouseUpEvent, () => {
        lastClickDuration = moment().diff(clickStartTimestamp);
        clickStartTimestamp = null;
      });
      this.map.on('click', (e) => {
        const clickLocation = proj4(proj4.WGS84, 'EPSG:3857', [ round(e.lngLat.lng, 6), round(e.lngLat.lat, 6) ]);
        this.click({
          coordinate: clickLocation,
          millisecondsSpentMouseDown: lastClickDuration
        })
      });

      // position management
      this.map.on('moveend', () => {
        const mapboxCenter = this.map.getCenter();
        this.centerChangeTriggeredByMe = true;
        this.setCenter(proj4(proj4.WGS84, 'EPSG:3857', [ round(mapboxCenter.lng, 6), round(mapboxCenter.lat, 6) ]))
        const zoom = round(this.map.getZoom(), 3);
        if (zoom && zoom !== this.zoom) {
          this.setZoom(zoom + 1);
        }
      });
    });
  },
  methods: {
    ...mapActions(["setZoom", "setCenter", "click"]),
  },
  watch: {
    centerEpsg4326: function (newCenter) {
      if (this.map) {
        if (this.centerChangeTriggeredByMe) {
          this.centerChangeTriggeredByMe = false;
        } else {
          this.map.flyTo({
            center: newCenter,
            zoom: this.zoom,
          });
        }
      }
    },
    zoom: function (newZoom) {
      if (this.map) {
        this.map.flyTo({
          center: this.centerEpsg4326,
          zoom: newZoom,
        })
      }
    },
  },
  provide: function () {
    return {
      getMap: () => this.map,
      getStyle: () => this.style,
    }
  }
};
</script>
