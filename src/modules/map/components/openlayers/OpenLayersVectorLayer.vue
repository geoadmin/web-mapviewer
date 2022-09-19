<template>
    <div>
        <slot />
    </div>
</template>

<script>
import MapLibreLayer from '@geoblocks/ol-maplibre-layer'
import axios from "axios";
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

/** Renders a Vector layer on the map with MapLibre */
export default {
    mixins: [addLayerToMapMixin],
    props: {
        layerId: {
            type: String,
            required: true,
        },
        styleUrl: {
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
    watch: {
        opacity(newOpacity) {
            this.layer.setOpacity(newOpacity)
        },
    },
    created() {
        this.layer = new MapLibreLayer({
            opacity: this.opacity,
            maplibreOptions: {
                style: this.styleUrl,
            },
        })
        // we load the style on the side in order to remove data over Switzerland (we are currently showing our standard National map as there is not enough details with our light vector map)
        axios.get(this.styleUrl).then((response) => {
            const vectorStyle = response.data
            // filtering out any layer that uses swisstopo data (meaning all layers that are over Switzerland)
            vectorStyle.layers = vectorStyle.layers.filter((layer) => layer.source !== 'swissmaptiles')
            this.layer.maplibreMap.setStyle(vectorStyle)
        })
    },
}
</script>
