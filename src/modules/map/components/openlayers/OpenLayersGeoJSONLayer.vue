<template>
  <div>
    <slot />
  </div>
</template>
<script>
import axios from 'axios'
import proj4 from 'proj4'
import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import GeoJSON from 'ol/format/GeoJSON'
import OlStyleForPropertyValue from './utils/styleFromLiterals'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'
import { reproject } from 'reproject'

/** Adds a GeoJSON layer to the OpenLayers map */
export default {
  mixins: [addLayerToMapMixin],
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
    },
  },
  watch: {
    opacity: function (newOpacity) {
      if (this.layer) {
        this.layer.setOpacity(newOpacity)
      }
    },
  },
  created() {
    // loading the GeoJSON data and style with and wait for both the be loaded
    axios
      .all([axios.get(this.geojsonUrl), axios.get(this.styleUrl)])
      .then((responses) => {
        const geojsonData = responses[0].data
        const geojsonStyleLiterals = responses[1].data
        const style = new OlStyleForPropertyValue(geojsonStyleLiterals)

        // if the GeoJSON describes a CRS (projection) we grab it so that we can reproject on the fly if needed
        const dataProjection = geojsonData.crs ? geojsonData.crs.properties.name : null

        // reprojecting the GeoJSON if not in EPSG:3857, the default projection for GeoJSON is WGS84
        // as stated in the reference https://tools.ietf.org/html/rfc7946#section-4
        // if another projection was set in the GeoJSON (through the "crs" property) we use it instead
        let reprojectedGeoJSON
        if (dataProjection) {
          if (dataProjection !== 'EPSG:3857') {
            reprojectedGeoJSON = reproject(geojsonData, dataProjection, 'EPSG:3857')
          } else {
            // it's already in the correct projection, we don't reproject
            reprojectedGeoJSON = geojsonData
          }
        } else {
          // according to the IETF reference, if nothing is said about the projection used, it should be WGS84
          reprojectedGeoJSON = reproject(geojsonData, proj4.WGS84, 'EPSG:3857')
        }
        this.layer = new VectorLayer({
          id: this.layerId,
          opacity: this.opacity,
          source: new VectorSource({
            features: new GeoJSON().readFeatures(reprojectedGeoJSON),
          }),
        })
        this.layer.setStyle(function (feature, res) {
          return style.getFeatureStyle(feature, res)
        })
      })
      .catch((error) => {
        console.error('Error while fetching GeoJSON data/style for layer ' + this.layerId, error)
      })
  },
}
</script>
