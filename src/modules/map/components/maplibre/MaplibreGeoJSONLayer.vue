<template>
  <div>
    <slot />
  </div>
</template>
<script>
import axios from "axios";
import addLayerToMaplibreMixin from "./utils/addLayerToMaplibre-mixins";
import transformGeoadminGeoJSONStyleIntoMapboxStyle
  from "@/modules/map/components/maplibre/utils/transformGeoadminGeoJSONStyleIntoMapboxStyle";

export default {
  props: {
    layerId: {
      type: String,
      required: true,
    },
    styleUrl: {
      type: String,
      required: true,
    },
    dataUrl: {
      type: String,
      required: true,
    },
    zIndex: {
      type: Number,
      default: -1,
    }
  },
  mixins: [addLayerToMaplibreMixin],
  created() {
    axios.all([axios.get(this.dataUrl), axios.get(this.styleUrl)])
    .then(responses => {
      const data = responses[0].data;
      const geoadminStyle = responses[1].data
      this.layerSource = {
        type: "geojson",
        data: data
      };
      this.layerStyle = {
        id: this.layerId,
        type: "circle",
        paint: transformGeoadminGeoJSONStyleIntoMapboxStyle(geoadminStyle)
      };
    });
  },
}
</script>