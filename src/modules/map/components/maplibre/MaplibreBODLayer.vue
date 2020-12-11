<template>
  <div>
    <MaplibreWMTSLayer v-if="layerConfig.type === LayerTypes.WMTS"
                       :layer-id="layerConfig.id"
                       :urls="layerConfig.getURLs()"
                       :opacity="layerConfig.opacity"
                       :z-index="zIndex" />
    <MaplibreWMSLayer v-if="layerConfig.type === LayerTypes.WMS"
                      :layer-id="layerConfig.id"
                      :url="layerConfig.getURL()"
                      :opacity="layerConfig.opacity"
                      :z-index="zIndex" />
    <MaplibreGeoJSONLayer v-if="layerConfig.type === LayerTypes.GEOJSON"
                          :layer-id="layerConfig.id"
                          :data-url="layerConfig.geoJsonUrl"
                          :style-url="layerConfig.styleUrl"
                          :z-index="zIndex" />
    <slot />
  </div>
</template>
<script>
import {mapGetters} from "vuex";
import {LayerTypes} from "@/api/layers.api";
import MaplibreWMTSLayer from "./MaplibreWMTSLayer";
import MaplibreWMSLayer from "@/modules/map/components/maplibre/MaplibreWMSLayer";
import MaplibreGeoJSONLayer from "@/modules/map/components/maplibre/MaplibreGeoJSONLayer";

export default {
  components: {MaplibreGeoJSONLayer, MaplibreWMSLayer, MaplibreWMTSLayer},
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
  },
  computed: {
    // In order to be able to manage aggregate layers we need to know the current map resolution
    ...mapGetters(['resolution'])
  },
  methods: {
    shouldAggregateSubLayerBeVisible: function (subLayer) {
      // min and max resolution are set in the API file to the lowest/highest possible value if undefined, so we don't
      // have to worry about checking their validity
      return this.resolution >= subLayer.minResolution && this.resolution <= subLayer.maxResolution;
    }
  },
};
</script>
