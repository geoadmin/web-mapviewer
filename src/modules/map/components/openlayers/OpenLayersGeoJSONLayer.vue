<template>
  <div>
    <slot />
  </div>
</template>
<script>
import axios from "axios";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import GeoJSON from "ol/format/GeoJSON";
import OlStyleForPropertyValue from "./openlayersStyleFromLiterals";
import openlayersLayerMixin from "./openlayers-mixins";
import { reproject } from "reproject";

export default {
  props: {
    layerId: {
      type: String,
      required: true,
    },
    geojsonUrl: {
      type: String,
      required: true,
    },
    styleUrl: {
      type: String,
      required: true,
    },
    opacity: {
      type: Number,
      default: 0.9,
    },
    zIndex: {
      type: Number,
      default: -1,
    }
  },
  mixins: [openlayersLayerMixin],
  created() {
    axios.all([axios.get(this.geojsonUrl), axios.get(this.styleUrl)])
      .then(responses => {
        const geojsonData = responses[0].data;
        const geojsonStyleLiterals = responses[1].data;
        const dataProjection = geojsonData.crs ? geojsonData.crs.properties.name : null;
        const style = new OlStyleForPropertyValue(geojsonStyleLiterals)
        this.layer = new VectorLayer({
          id: this.layerId,
          opacity: this.opacity,
          source: new VectorSource({
            features: new GeoJSON().readFeatures(dataProjection && dataProjection !== 'EPSG:3857' ? reproject(geojsonData, dataProjection, 'EPSG:3857') : geojsonData),
          }),
        })
        this.layer.setStyle(function (feature, res) {
          return style.getFeatureStyle(feature, res)
        })
      })
      .catch(error => {
        console.error('Error while fetching GeoJSON data/style for layer ' + this.layerId, error);
      })
  },
  watch: {
    opacity: function (newOpacity) {
      if (this.layer) {
        this.layer.setOpacity(newOpacity);
      }
    },
  }
}
</script>
