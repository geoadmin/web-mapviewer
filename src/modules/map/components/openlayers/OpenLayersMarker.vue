<template>
  <div>
    <slot />
  </div>
</template>
<script>
import { Circle as CircleStyle, Fill, Icon as IconStyle, Stroke, Style } from 'ol/style'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import Feature from 'ol/Feature'
import { Point } from 'ol/geom'

import { randomIntBetween } from '@/utils/numberUtils'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

const markerBalloonStyle = new Style({
  image: new IconStyle({
    anchor: [0.5, 1],
    src: require('@/modules/map/assets/marker.png'),
  }),
})
// style for geolocation point
const markerPositionStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({
      color: [255, 0, 0, 0.9],
    }),
    stroke: new Stroke({
      color: [255, 255, 255, 1],
      width: 3,
    }),
  }),
})
const markerHiddenStyle = new Style({
  visible: false,
})

/**
 * @enum
 */
export const markerStyles = {
  BALLOON: 'balloon',
  POSITION: 'position',
  HIDDEN: 'hidden',
}

export default {
  mixins: [addLayerToMapMixin],
  props: {
    position: {
      type: Array,
      default: () => [0, 0],
      required: true,
    },
    markerStyle: {
      type: String,
      default: markerStyles.BALLOON,
    },
    radius: {
      type: Number,
      default: 0,
    },
    zIndex: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      marker: null,
    }
  },
  inject: ['getMap'],
  computed: {
    style: function () {
      switch (this.markerStyle) {
        case markerStyles.POSITION:
          return markerPositionStyle
        case markerStyles.BALLOON:
          return markerBalloonStyle
        case markerStyles.HIDDEN:
        default:
          return markerHiddenStyle
      }
    },
  },
  watch: {
    position: function (newPosition) {
      this.marker.getGeometry().setCoordinates(newPosition)
    },
    markerStyle: function () {
      this.marker.setStyle(this.style)
    },
  },
  created() {
    const randomId = randomIntBetween(0, 100000)
    this.marker = new Feature({
      id: `marker-${randomId}`,
      geometry: new Point(this.position),
    })
    this.marker.setStyle(this.style)
    this.layer = new VectorLayer({
      id: `marker-layer-${randomId}`,
      source: new VectorSource({
        features: [this.marker],
      }),
    })
  },
}
</script>
