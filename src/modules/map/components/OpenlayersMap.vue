<template>
  <!-- preventing right click (or long left click) to trigger the contextual menu of the browser-->
  <div id="ol-map" oncontextmenu="return false">
    <div id="scale-line" ref="scaleLine"></div>
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

import proj4 from "proj4";
import moment from "moment";

import {mapState, mapGetters, mapActions} from "vuex";
import {Map, View} from 'ol';
import { Tile as TileLayer, Image as ImageLayer, Vector as VectorLayer } from "ol/layer";
import { XYZ as XYZSource, ImageWMS as WMSSource, Vector as VectorSource } from "ol/source";
import { Icon as IconStyle, Style, Circle as CircleStyle, Fill, Stroke } from "ol/style";
import ScaleLine from "ol/control/ScaleLine"
import Feature from "ol/Feature";
import { Point, Circle } from "ol/geom";
import { isMobile } from 'mobile-device-detect';

import { round } from "@/numberUtils";
import { LayerTypes } from "@/api/layers.api";
import {randomIntBetween} from "@/numberUtils";

const markerBalloonStyle = new Style({
  image: new IconStyle({
    anchor: [0.5, 1],
    src: require('../assets/marker.png'),
  }),
});
const markerPositionStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({
      color: [255, 0, 0, 0.9]
    }),
    stroke: new Stroke({
      color: [255, 255, 255, 1],
      width: 3
    })
  })
});
const markerAccuracyStyle = new Style({
  fill: new Fill({
    color: [255, 0, 0, 0.1]
  }),
  stroke: new Stroke({
    color: [255, 0, 0, 0.9],
    width: 3
  }),
})

export default {
  computed: {
    ...mapState({
      zoom: state => state.position.zoom,
      center: state => state.position.center,
      highlightedFeature: state => state.map.highlightedFeature,
      pinLocation: state => state.map.pinLocation,
      geolocationActive: state => state.geolocation.active,
      geolocationPosition: state => state.geolocation.position,
      geolocationAccuracy: state => state.geolocation.accuracy,
    }),
    ...mapGetters(["visibleLayers", "currentBackgroundLayer", "extent"]),
    layers: function () {
      let layers = [];
      // background layer
      if (this.currentBackgroundLayer) {
        layers.push(this.createOpenLayersObjectForLayer(this.currentBackgroundLayer));
      }
      // all active (and visible) layers
      this.visibleLayers.forEach(visibleLayer => visibleLayer && layers.push(this.createOpenLayersObjectForLayer(visibleLayer)))
      // managing marker(s)
      const markers = [];
      // if a highlighted feature is set, we put it on top of the layer stack
      if (this.highlightedFeature) {
        if (this.highlightedFeature.type === 'layer') {
          layers.push(this.createOpenLayersObjectForLayer(this.highlightedFeature.layerConfig))
        } else if (this.highlightedFeature.type === 'location') {
          markers.push(this.createMarkerAtPosition(this.highlightedFeature.coordinate));
        } else {
          console.error('Unknown feature type', this.highlightedFeature);
        }
      }
      if (this.geolocationActive && this.geolocationPosition[0] !== 0) {
        markers.push(this.createMarkerAtPosition(this.geolocationPosition, markerPositionStyle));
        // showing accuracy circle only on mobile devices
        if (isMobile) {
          const accuracyGeom = new Circle(this.geolocationPosition, this.geolocationAccuracy);
          const accuracyFeature = new Feature({
            geometry: accuracyGeom,
          })
          accuracyFeature.setStyle(markerAccuracyStyle);
          markers.push(accuracyFeature);
        }
      }
      if (markers.length > 0) {
        layers.push(new VectorLayer({
          id: `marker-layer`,
          source: new VectorSource({
            features: markers
          })
        }));
      }
      return layers;
    }
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
    // Setting up OL objects
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
    this.map.on('moveend', () => {
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
        case LayerTypes.WMTS:
          layerObject = new TileLayer({
            id: layer.id,
            opacity: layer.opacity,
            source: new XYZSource({
              projection: layer.projection,
              url: layer.getURL()
            })
          })
          break;
        case LayerTypes.WMS:
          layerObject = new ImageLayer({
            id: layer.id,
            opacity: layer.opacity,
            source: new WMSSource({
              url: layer.getURL()
            })
          })
          break;
        default:
          console.error(`Unknown type of layer ${layer.type}`)
      }
      return layerObject;
    },
    projectToEpsg3857: coords => proj4(proj4.WGS84, proj4("EPSG:3857"), coords),
    createMarkerAtPosition(position, style) {
      const marker = new Feature({
        id: 'marker-' + randomIntBetween(0, 100000),
        geometry: new Point(position),
      });
      marker.setStyle(style ? style : markerBalloonStyle);
      return marker;
    },
  },
  data: () => {
    return {
      map: null,
      view: null,
      moveInitiatedByStoreChange: false,
      controls: {
        attribution: true,
        rotate: false,
        zoom: false,
      }
    }
  }
};
</script>
