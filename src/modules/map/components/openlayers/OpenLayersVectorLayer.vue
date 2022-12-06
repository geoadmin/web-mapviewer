<template>
    <div>
        <slot />
    </div>
</template>

<script>
import MapLibreLayer from '@geoblocks/ol-maplibre-layer'
import axios from 'axios'
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
        excludeSource: {
            type: String,
            default: null,
        },
    },
    computed: {
        mapLibreInstance() {
            return this.layer?.mapLibreInstance
        }
    },
    watch: {
        opacity(newOpacity) {
            this.layer.setOpacity(newOpacity)
        },
        styleUrl(newStyleUrl) {
            if (this.mapLibreInstance) {
                this.mapLibreInstance.setStyle(newStyleUrl)
            }
        },
    },
    created() {
        this.layer = new MapLibreLayer({
            opacity: this.opacity,
            maplibreOptions: {
                style: this.styleUrl,
            },
        })
        if (this.excludeSource) {
            // we load the style on the side in order to be able to filter out some source
            axios.get(this.styleUrl).then((response) => {
                const vectorStyle = response.data
                vectorStyle.layers = vectorStyle.layers.filter(
                  (layer) => layer.source !== this.excludeSource
                )
                this.layer.maplibreMap.setStyle(vectorStyle)
            })
        }
    },
}
</script>
