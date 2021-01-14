<template>
  <div>
    <OpenLayersWMTSLayer
      v-if="layerConfig.type === LayerTypes.WMTS"
      :layer-id="layerConfig.id"
      :opacity="layerConfig.opacity"
      :url="layerConfig.getURL()"
      :z-index="zIndex"
    />
    <OpenLayersWMSLayer
      v-if="layerConfig.type === LayerTypes.WMS"
      :layer-id="layerConfig.id"
      :opacity="layerConfig.opacity"
      :url="layerConfig.getURL()"
      :gutter="layerConfig.gutter"
      :z-index="zIndex"
    />
    <OpenLayersGeoJSONLayer
      v-if="layerConfig.type === LayerTypes.GEOJSON"
      :layer-id="layerConfig.id"
      :opacity="layerConfig.opacity"
      :geojson-url="layerConfig.geoJsonUrl"
      :style-url="layerConfig.styleUrl"
      :z-index="zIndex"
    />
    <!--
     Aggregate layers are some kind of a edge case where two or more layers are joint together but only one of them
     is visible depending on the map resolution.
     We have to manage aggregate layers straight here otherwise we won't be able to make a recursive call to this
     component in another child (that would be OpenLayersAggregateLayer.vue component, that doesn't work).
     See https://vuejs.org/v2/guide/components-edge-cases.html#Recursive-Components for more info
    -->
    <div v-if="layerConfig.type === LayerTypes.AGGREGATE">
      <!-- we can't v-for and v-if at the same time, so we need to wrap all sub-layers in a <div> -->
      <div v-for="aggregateSubLayer in layerConfig.subLayers" :key="aggregateSubLayer.subLayerId">
        <open-layers-bod-layer
          v-if="shouldAggregateSubLayerBeVisible(aggregateSubLayer)"
          :layer-config="aggregateSubLayer.layer"
          :z-index="zIndex"
        />
      </div>
    </div>
    <slot />
  </div>
</template>

<script>
import { LayerTypes } from '@/api/layers.api'
import OpenLayersWMTSLayer from './OpenLayersWMTSLayer'
import OpenLayersWMSLayer from './OpenLayersWMSLayer'
import OpenLayersGeoJSONLayer from './OpenLayersGeoJSONLayer'
import { mapGetters } from 'vuex'

export default {
  // So that we can recursively call ourselves in the template for aggregate layers
  name: 'OpenLayersBodLayer',
  components: { OpenLayersGeoJSONLayer, OpenLayersWMSLayer, OpenLayersWMTSLayer },
  props: {
    layerConfig: {
      type: Object,
      default: null,
    },
    zIndex: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      LayerTypes,
    }
  },
  computed: {
    // In order to be able to manage aggregate layers we need to know the current map resolution
    ...mapGetters(['resolution']),
  },
  methods: {
    shouldAggregateSubLayerBeVisible: function (subLayer) {
      // min and max resolution are set in the API file to the lowest/highest possible value if undefined, so we don't
      // have to worry about checking their validity
      return this.resolution >= subLayer.minResolution && this.resolution <= subLayer.maxResolution
    },
  },
}
</script>
