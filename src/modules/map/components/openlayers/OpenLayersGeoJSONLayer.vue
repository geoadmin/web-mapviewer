<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { CoordinateSystems } from '@/utils/coordinateUtils'
import log from '@/utils/logging'
import axios from 'axios'
import GeoJSON from 'ol/format/GeoJSON'
import { Vector as VectorLayer } from 'ol/layer'
import { get as getProjection } from 'ol/proj'
import { Vector as VectorSource } from 'ol/source'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'
import OlStyleForPropertyValue from './utils/styleFromLiterals'

/** Adds a GeoJSON layer to the OpenLayers map */
export default {
    mixins: [addLayerToMapMixin],
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
        zIndex: {
            type: Number,
            default: -1,
        },
    },
    watch: {
        opacity(newOpacity) {
            if (this.layer) {
                this.layer.setOpacity(newOpacity)
            }
        },
        geojsonUrl() {
            this.loadData()
        },
        styleUrl() {
            this.loadStyle()
        },
    },
    created() {
        // The layer needs to be set immediately. Otherwise, addLayerToMapMixin will fail.
        this.layer = new VectorLayer({ id: this.layerId, opacity: this.opacity })
    },
    mounted() {
        this.loadStyle()
        this.loadData()
    },
    methods: {
        async loadStyle() {
            try {
                const style = new OlStyleForPropertyValue((await axios.get(this.styleUrl)).data)

                this.layer.setStyle(function (feature, res) {
                    return style.getFeatureStyle(feature, res)
                })
            } catch (err) {
                log.error('Unable to load style for GeoJSON layer', this.layerId, err)
            }
        },
        async loadData() {
            try {
                const geoJsonData = (await axios.get(this.geojsonUrl)).data

                // filtering any feature that doesn't define an ID (otherwise it breaks the whole loading process in OL)
                geoJsonData.features = geoJsonData.features.filter((feature) => feature.id)

                // if the GeoJSON describes a CRS (projection) we grab it so that we can reproject on the fly if needed
                // according to the IETF reference, if nothing is said about the projection used, it should be WGS84
                const dataProjection = geoJsonData.crs
                    ? geoJsonData.crs.properties.name
                    : CoordinateSystems.WGS84.epsg

                this.layer.setSource(
                    new VectorSource({
                        features: new GeoJSON().readFeatures(geoJsonData, {
                            dataProjection,
                            featureProjection: getProjection(CoordinateSystems.WEBMERCATOR.epsg),
                        }),
                    })
                )
            } catch (err) {
                log.error('Unable to load data for GeoJSON layer', this.layerId, err)
            }
        },
    },
}
</script>
