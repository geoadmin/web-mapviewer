<template>
  <div>
    <slot />
  </div>
</template>
<script>
import { Image as ImageLayer, Tile as TileLayer } from "ol/layer"
import ImageWMS from "ol/source/ImageWMS"
import TileWMS from "ol/source/TileWMS"
import TileGrid from "ol/tilegrid/TileGrid"
import addLayerToMapMixin from "./utils/addLayerToMap-mixins";

export default {
  props: {
    layerId: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    opacity: {
      type: Number,
      default: 1.0,
    },
    zIndex: {
      type: Number,
      default: -1,
    },
    gutter: {
      type: Number,
      default: -1,
    },
  },
  mixins: [addLayerToMapMixin],
  created() {
    if (this.gutter !== -1) {
      this.layer = new TileLayer({
        id: this.layerId,
        opacity: this.opacity,
        source: new TileWMS({
          url: this.url,
          gutter: this.gutter,
          tileGrid: new TileGrid({
            tileSize: 512,
            origin: [558147.80, 6152731.53],
            resolutions: [4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25, 0.1],
          })
        })
      })
    } else {
      this.layer = new ImageLayer({
        id: this.layerId,
        opacity: this.opacity,
        source: new ImageWMS({
          url: this.url,
        })
      })
    }
  },
  watch: {
    url: function (newUrl) {
      this.layer.getSource().setUrl(newUrl);
    },
    opacity: function (newOpacity) {
      this.layer.setOpacity(newOpacity);
    }
  },
}
</script>
