<template>
    <div>
        <slot />
    </div>
</template>
<script>
import addLayerToMaplibreMixin from './utils/addLayerToMaplibre-mixins'

export default {
    mixins: [addLayerToMaplibreMixin],
    props: {
        layerId: {
            type: String,
            required: true,
        },
        opacity: {
            type: Number,
            default: 1.0,
        },
        projection: {
            type: String,
            default: 'EPSG:3857',
        },
        visible: {
            type: Boolean,
            default: true,
        },
        url: {
            type: String,
            required: true,
        },
        zIndex: {
            type: Number,
            default: -1,
        },
    },
    data() {
        return {
            layerStyle: null,
            layerSource: null,
        }
    },
    created() {
        this.layerSource = {
            type: 'raster',
            id: `source-${this.layerId}`,
            tiles: [this.url],
            tileSize: 256,
        }
        this.layerStyle = {
            id: this.layerId,
            type: 'raster',
            opacity: this.opacity,
        }
    },
}
</script>
