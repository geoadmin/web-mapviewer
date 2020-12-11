<template>
  <div>
    <slot/>
  </div>
</template>
<script>
import addLayerToMaplibreMixin from "./utils/addLayerToMaplibre-mixins";

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
    projection: {
      type: String,
      default: 'EPSG:3857'
    }
  },
  mixins: [addLayerToMaplibreMixin],
  data() {
    return {
      layerStyle: null,
      layerSource: null,
    }
  },
  created() {
    const tileSize = 256;
    this.layerSource = {
      type: "raster",
      tiles: [this.url + `&WIDTH=${tileSize}&HEIGHT=${tileSize}&BBOX={bbox-epsg-3857}&CRS=${this.projection}`],
      tileSize: tileSize
    }
    this.layerStyle = {
      id: this.layerId,
      type: "raster",
    }
  },
};
</script>