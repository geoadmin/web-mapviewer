<template>
  <div>
    <OpenLayersWMTSLayer v-if="layerConfig.type === LayerTypes.WMTS"
                         :layer-id="layerConfig.id"
                         :opacity="layerConfig.opacity"
                         :url="layerConfig.getURL()"
                         :z-index="zIndex" />
    <OpenLayersWMSLayer v-if="layerConfig.type === LayerTypes.WMS"
                        :layer-id="layerConfig.id"
                        :opacity="layerConfig.opacity"
                        :url="layerConfig.getURL()"
                        :z-index="zIndex" />
    <OpenLayersGeoJSONLayer v-if="layerConfig.type === LayerTypes.GEOJSON"
                            :layer-id="layerConfig.id"
                            :opacity="layerConfig.opacity"
                            :geojson-url="layerConfig.geoJsonUrl"
                            :style-url="layerConfig.styleUrl"
                            :z-index="zIndex" />
    <slot />
  </div>
</template>

<script>
import { LayerTypes } from "@/api/layers.api";
import OpenLayersWMTSLayer from "./OpenLayersWMTSLayer";
import OpenLayersWMSLayer from "./OpenLayersWMSLayer";
import OpenLayersGeoJSONLayer from "./OpenLayersGeoJSONLayer";

export default {
  components: {OpenLayersGeoJSONLayer, OpenLayersWMSLayer, OpenLayersWMTSLayer},
  props: {
    layerConfig: {
      type: Object,
      default: null
    },
    zIndex: {
      type: Number,
      default: -1,
    }
  },
  data() {
    return {
      LayerTypes,
    }
  }
}
</script>
