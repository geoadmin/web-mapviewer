<template>
  <div>
    <slot />
  </div>
</template>
<script>
import { Tile as TileLayer } from 'ol/layer'
import { XYZ as XYZSource } from 'ol/source'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

/** Renders a WMTS layer on the map */
export default {
  mixins: [addLayerToMapMixin],
  props: {
    layerId: {
      type: String,
      required: true,
    },
    opacity: {
      type: Number,
      default: 1.0,
    },
    projection: {
      type: String,
      default: 'EPSG:3857',
    },
    visible: {
      type: Boolean,
      default: true,
    },
    url: {
      type: String,
      required: true,
    },
    zIndex: {
      type: Number,
      default: -1,
    },
  },
  watch: {
    opacity: function (newOpacity) {
      this.layer.setOpacity(newOpacity)
    },
    visible: function (newVisibility) {
      this.layer.setVisible(newVisibility)
    },
    url: function (newUrl) {
      this.layer.getSource().setUrl(newUrl)
    },
  },
  created() {
    this.layer = new TileLayer({
      id: this.layerId,
      opacity: this.opacity,
      source: new XYZSource({
        projection: this.projection,
        url: this.url,
      }),
      visible: this.visible,
    })
  },
}
</script>
