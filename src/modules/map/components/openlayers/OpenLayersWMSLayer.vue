<template>
  <div>
    <slot />
  </div>
</template>
<script>
import { Image as ImageLayer } from "ol/layer"
import ImageWMS from "ol/source/ImageWMS"
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
  },
  mixins: [addLayerToMapMixin],
  created() {
    this.layer = new ImageLayer({
      id: this.layerId,
      opacity: this.opacity,
      source: new ImageWMS({
        url: this.url
      })
    })
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
