<template>
  <div>
    <slot />
  </div>
</template>
<script>
import addLayerToMaplibreMixin from "./utils/addLayerToMaplibre-mixins";

export default {
  props: {
    layer: {
      type: Object,
      required: true,
    },
    zIndex: {
      type: Number,
      default: -1,
    }
  },
  data() {
    return {
      layerStyle: null,
      layerSource: null,
    }
  },
  mixins: [addLayerToMaplibreMixin],
  created() {
    this.layerSource = {
      type: "raster",
      tiles: [this.layer.getURL()],
      tileSize: 256
    };
    this.layerStyle = {
      id: this.layer.id,
      type: "raster"
    };
  },
}
</script>
