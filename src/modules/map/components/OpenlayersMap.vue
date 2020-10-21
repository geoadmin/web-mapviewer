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
import { Tile as TileLayer, Image as ImageLayer, Vector as VectorLayer } from "ol/layer";
import { XYZ as XYZSource, ImageWMS as WMSSource, Vector as VectorSource } from "ol/source";
import { Icon as IconStyle, Style } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import { round } from "@/numberUtils";

const markerStyle = new Style({
  image: new IconStyle({
    anchor: [0.5, 1],
    src: require('../assets/marker.png'),
  }),
});

export default {
  computed: {
    ...mapState({
      extent: state => state.position.extent,
      mapIsBeingDragged: state => state.map.isBeingDragged,
      highlightedFeature: state => state.map.highlightedFeature,
      pinLocation: state => state.map.pinLocation,
    }),
    ...mapGetters(["center", "visibleLayers", "currentBackgroundLayer", "zoom"]),
    extentForOL: function () {
      // OL wants an extent as a one liner array
      return [ this.extent.bottomLeft[0], this.extent.bottomLeft[1], this.extent.topRight[0], this.extent.topRight[1] ];
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
        } else if (this.highlightedFeature.type === 'location') {
          const marker = new Feature({
            geometry: new Point(this.highlightedFeature.coordinate),
          });
          marker.setStyle(markerStyle);
          layers.push(new VectorLayer({
            id: `marker-${this.highlightedFeature.id}`,
            source: new VectorSource({
              features: [ marker ]
            })
          }))
        } else {
          console.error('Unknown feature type', this.highlightedFeature);
        }
      }
      return layers;
    }
  },
  watch: {
    extent: function () {
      this.view.animate({
        zoom: this.zoom,
        center: this.center,
        duration: 250
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
      center: this.center,
      zoom: this.zoom,
    });
    this.map = new Map({
      target: 'ol-map',
      layers: this.layers,
      view: this.view,
      controls: []
    });
    this.view.fit(this.extentForOL);
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
    createOpenLayersObjectForLayer: function (layer) {
      if (!layer) return null;
      let layerObject = null;
      switch(layer.type) {
        case 'wmts':
          layerObject = new TileLayer({
            id: layer.id,
            opacity: layer.opacity,
            source: new XYZSource({
              projection: layer.projection,
              url: layer.url
            })
          })
          break;
        case 'wms':
          layerObject = new ImageLayer({
            id: layer.id,
            opacity: layer.opacity,
            source: new WMSSource({
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
        source: new XYZSource({
          projection: 'EPSG:3857',
          url: `https://wmts5.geo.admin.ch/1.0.0/${layerId}/default/current/3857/{z}/{x}/{y}.${imageFormat ? imageFormat : 'png'}`
        })
      })
    },
    projectToEpsg3857: coords => proj4(proj4.WGS84, proj4("EPSG:3857"), coords),
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
