<template>
    <div>
        <slot />
    </div>
</template>

<script>
import axios from 'axios'
import OlStyleForPropertyValue from '@/modules/map/components/openlayers/utils/styleFromLiterals'
import GeoJSON from 'ol/format/GeoJSON'
import { Vector as VectorSource } from 'ol/source'
import log from '@/utils/logging'
import addPrimitiveLayerMixins from './utils/addPrimitiveLayer-mixins'

/** Adds a GeoJSON layer to the Cesium viewer */
export default {
    mixins: [addPrimitiveLayerMixins],
    props: {
        layerId: {
            type: String,
            required: true,
        },
        geojsonUrl: {
            type: String,
            required: true,
        },
        styleUrl: {
            type: String,
            required: true,
        },
        opacity: {
            type: Number,
            default: 0.9,
        },
    },
    methods: {
        loadLayer() {
            return Promise.all([axios.get(this.geojsonUrl), axios.get(this.styleUrl)])
                .then((responses) => {
                    const geojsonData = responses[0].data
                    const geojsonStyleLiterals = responses[1].data
                    const style = new OlStyleForPropertyValue(geojsonStyleLiterals)
                    this.olLayer.setSource(
                        new VectorSource({
                            features: new GeoJSON().readFeatures(geojsonData),
                        })
                    )
                    this.olLayer.setStyle(function (feature, res) {
                        return style.getFeatureStyle(feature, res)
                    })
                    return geojsonData.crs ? geojsonData.crs.properties.name : null
                })
                .catch((error) => {
                    log.error(
                        'Error while fetching GeoJSON data/style for layer ' + this.layerId,
                        error
                    )
                })
        },
    },
}
</script>
