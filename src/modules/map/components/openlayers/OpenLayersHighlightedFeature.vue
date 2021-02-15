<template>
  <div>
    <OpenLayersMarker
      v-if="!doesFeatureHaveAGeometry"
      :position="feature.coordinate"
      :marker-style="markerStyles.FEATURE"
      :z-index="zIndex"
    />
    <slot />
  </div>
</template>
<script>
import VectorLayer from 'ol/layer/Vector'
import { Vector as VectorSource } from 'ol/source'
import OpenLayersFeature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import Style from 'ol/style/Style'
import { Feature } from '@/api/features.api'
import OpenLayersMarker, {
  highlightedFill,
  highlightedStroke,
  highlightPointStyle,
  markerStyles,
} from '@/modules/map/components/openlayers/OpenLayersMarker'
import addLayerToMapMixin from '@/modules/map/components/openlayers/utils/addLayerToMap-mixins'

const geoJsonStyleFunction = (olFeature) => {
  const geoJsonType = olFeature.get('geometry').getType()
  switch (geoJsonType) {
    case 'LineString':
    case 'MultiLineString':
      return new Style({
        stroke: highlightedStroke,
      })
    case 'Polygon':
    case 'MultiPolygon':
    case 'Circle':
    case 'GeometryCollection':
      return new Style({
        stroke: highlightedStroke,
        fill: highlightedFill,
      })
    case 'Point':
    case 'MultiPoint':
      return highlightPointStyle
    default:
      return null
  }
}

/**
 * Renders a feature geometry on the map with a highlighted style
 */
export default {
  components: { OpenLayersMarker },
  mixins: [addLayerToMapMixin],
  props: {
    feature: {
      type: Feature,
      required: true,
    },
    zIndex: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      markerStyles,
      layer: null,
    }
  },
  computed: {
    doesFeatureHaveAGeometry: function () {
      return this.feature && this.feature.geometry
    },
    openLayersGeoJsonGeometry: function () {
      if (this.doesFeatureHaveAGeometry) {
        return new GeoJSON().readGeometry(this.feature.geometry, {
          dataProject: 'EPSG:3857',
        })
      }
      return null
    },
  },
  created() {
    // if the feature has a geometry, we add it through a new vector layer, otherwise a marker will be added in the template above
    if (this.doesFeatureHaveAGeometry) {
      this.geometry = new OpenLayersFeature({
        id: `geometry-feature-${this.feature.id}`,
        geometry: this.openLayersGeoJsonGeometry,
      })
      this.layer = new VectorLayer({
        id: `geometry-layer-feature-${this.feature.id}`,
        source: new VectorSource({
          features: [this.geometry],
        }),
        style: geoJsonStyleFunction,
      })
    }
  },
}
</script>
