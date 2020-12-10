<template>
  <div>
    <MaplibreWMTSLayer v-if="layerConfig.type === LayerTypes.WMTS" :layer="layerConfig" :z-index="zIndex" />
    <slot />
  </div>
</template>
<script>
import {mapGetters} from "vuex";
import {LayerTypes} from "@/api/layers.api";
import MaplibreWMTSLayer from "./MaplibreWMTSLayer";

export default {
  components: {MaplibreWMTSLayer},
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
