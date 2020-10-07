<template>
  <div id="ol-map"></div>
</template>

<style>
#ol-map {
  width: 100%;
  height: 100%;
}
</style>

<script>
import 'ol/ol.css';

import proj4 from "proj4";

import {mapState, mapGetters, mapActions} from "vuex";
import {Map, View} from 'ol';
import {toLonLat} from 'ol/proj';
import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import XYZ from "ol/source/XYZ";
import WMS from "ol/source/ImageWMS";

proj4.defs(
    "EPSG:3857",
    "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"
);

export default {
  computed: {
    ...mapState({
      latitude: state => state.position.latitude,
      longitude: state => state.position.longitude,
      zoom: state => state.position.zoom,
      mapIsBeingDragged: state => state.map.isBeingDragged,
      highlightedFeature: state => state.map.highlightedFeature,
    }),
    ...mapGetters(["center", "visibleLayers", "currentBackgroundLayer"]),
    centerEpsg3857: function () {
      return proj4(proj4.WGS84, proj4("EPSG:3857"), this.center);
    },
    layers: function () {
      let layers = [];
      // background layer
      if (this.currentBackgroundLayer) {
        layers.push(this.createOpenLayersObjectForLayer(this.currentBackgroundLayer));
      }
      // all active (and visible) layers
      this.visibleLayers.forEach(visibleLayer => visibleLayer && layers.push(this.createOpenLayersObjectForLayer(visibleLayer)))
      // if a highlighted feature is set, we put it on top of the layer stack
      if (this.highlightedFeature) {
        if (this.highlightedFeature.type === 'layer') {
          layers.push(this.createOpenLayersObjectForLayer(this.highlightedFeature.layerConfig))
        }
      }
      return layers;
    }
  },
  watch: {
    zoom: function (val) {
      this.view.animate({
        zoom: val,
        duration: 200
      });
    },
    centerEpsg3857: function (val) {
      this.view.animate({
        center: val,
        duration: 500
      })
    },
    layers: function (newLayers) {
      if (!newLayers) return;
      const olLayers = this.map.getLayers();
      // first we read all current layer's ids in order to know which one needs to be removed
      const currentlyShownLayers = olLayers.getArray().map(layer => layer.get('id'));
      const nextShownLayers = newLayers.map(layer => layer.get('id'));
      // removing all layer that are not present in the new layer list
      currentlyShownLayers.filter(layerId => !nextShownLayers.includes(layerId))
                          .forEach(layerIdToRemove => {
                            olLayers.forEach((layer, index) => {
                              if (layer && layer.get('id') === layerIdToRemove) {
                                olLayers.removeAt(index);
                              }
                            });
                          })
      // now we parse the current layers and insert any layer that is not yet present in the order it comes
      if (olLayers.getLength() < newLayers.length) {
        newLayers.forEach((layer, index) => {
          if (olLayers.getLength() < index + 1) {
            olLayers.push(layer);
          } else {
            // we have to place our layer in the right place, checking if an item exist already here or not
            const olLayerAtIndex = olLayers.item(index);
            // if it's not the same layer, we insert the new layer at this position
            if (olLayerAtIndex.get('id') !== layer.get('id')) {
              olLayers.insertAt(index, layer);
            }
          }
        })
      }
    },
  },
  mounted() {
    this.view = new View({
      center: this.centerEpsg3857,
      zoom: this.zoom
    });
    this.map = new Map({
      target: 'ol-map',
      layers: this.layers,
      view: this.view,
      controls: []
    });
    this.map.on('pointerdrag', () => {
      if (!this.mapIsBeingDragged) this.mapStartBeingDragged();
    })
    this.map.on('moveend', () => {
      if (this.mapIsBeingDragged) this.mapStoppedBeingDragged();
      if (this.view) {
        const [longitude, latitude] = toLonLat(this.view.getCenter());
        if (latitude !== this.latitude || longitude !== this.longitude) {
          this.setCenter({
            latitude: latitude,
            longitude: longitude
          });
        }
        const zoom = this.view.getZoom();
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
    ...mapActions(["setCenter", "setZoom", "click", 'mapStoppedBeingDragged', 'mapStartBeingDragged']),
    createOpenLayersObjectForLayer: function (layer) {
      if (!layer) return null;
      let layerObject = null;
      switch(layer.type) {
        case 'wmts':
          layerObject = new TileLayer({
            id: layer.id,
            opacity: layer.opacity,
            source: new XYZ({
              projection: layer.projection,
              url: layer.url
            })
          })
          break;
        case 'wms':
          layerObject = new ImageLayer({
            id: layer.id,
            opacity: layer.opacity,
            source: new WMS({
              url: layer.url
            })
          })
          break;
        default:
          console.error(`Unknown type of layer ${layer.type}`)
      }
      return layerObject;
    },
    createOLTileLayerObject: (layerId, imageFormat) => {
      return new TileLayer({
        id: layerId,
        source: new XYZ({
          projection: 'EPSG:3857',
          url: `https://wmts5.geo.admin.ch/1.0.0/${layerId}/default/current/3857/{z}/{x}/{y}.${imageFormat ? imageFormat : 'png'}`
        })
      })
    },
  },
  data: () => {
    return {
      map: null,
      view: null,
      controls: {
        attribution: true,
        rotate: false,
        zoom: false,
      }
    }
  }
};
</script>
