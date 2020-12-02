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
import {TILEGRID_ORIGIN, TILEGRID_RESOLUTIONS, WMS_TILE_SIZE} from "@/config";

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
    projection: {
      type: String,
      default: 'EPSG:3857'
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
            projection: this.projection,
            tileSize: WMS_TILE_SIZE,
            origin: TILEGRID_ORIGIN,
            resolutions: TILEGRID_RESOLUTIONS,
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
