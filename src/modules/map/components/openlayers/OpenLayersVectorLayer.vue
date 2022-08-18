<template>
    <div>
        <slot />
    </div>
</template>

<script>
import MapLibreLayer from '@geoblocks/ol-maplibre-layer'
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
    },
}
</script>
