<template>
  <div>
    <slot />
  </div>
</template>
<script>
import {Circle} from "ol/geom";
import Feature from "ol/Feature";
import {Vector as VectorLayer} from "ol/layer";
import {Vector as VectorSource} from "ol/source";
import {Fill, Stroke, Style} from "ol/style";

const accuracyCircleStyle = new Style({
  fill: new Fill({
    color: [255, 0, 0, 0.1]
  }),
  stroke: new Stroke({
    color: [255, 0, 0, 0.9],
    width: 3
  }),
})

export default {
  props: {
    position: {
      type: Array,
      required: true
    },
    accuracy: {
      type: Number,
      required: true
    }
  },
  inject: ['getMap'],
  data() {
    return {
      accuracyCircle: null,
      accuracyCircleFeature: null,
      layer: null,
    }
  },
  mounted() {
    this.accuracyCircle = new Circle(this.position, this.accuracy);
    this.accuracyCircleFeature = new Feature({
      geometry: this.accuracyCircle,
    });
    this.accuracyCircleFeature.setStyle(accuracyCircleStyle);
    this.layer = new VectorLayer({
      id: `geolocation-accuracy-layer`,
      source: new VectorSource({
        features: [this.accuracyCircleFeature]
      })
    })
    this.getMap().addLayer(this.layer);
  },
  destroyed() {
    this.getMap().removeLayer(this.layer);
  },
  watch: {
    position: function (newPosition) {
      this.accuracyCircle.setCenter(newPosition);
    },
    accuracy: function (newAccuracy) {
      this.accuracyCircle.setRadius(newAccuracy);
    },
  }
}
</script>
