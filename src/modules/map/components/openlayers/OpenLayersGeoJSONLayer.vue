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
import { Vector as VectorSource } from 'ol/source'
import { reproject } from 'reproject'
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
    },
    created() {
        // The layers needs to be set immediately. Otherwise, addLayerToMapMixin will fail.
        this.layer = new VectorLayer({ id: this.layerId, opacity: this.opacity })

        // loading the GeoJSON data and style with and wait for both the be loaded
        // WARNING: axios.get(this.styleUrl) will not work on localhost and will fire a CORS error !!
        // this is due to the fact that the backend send the styleUrl agnostic whitout HTTP scheme !
        Promise.all([axios.get(this.geojsonUrl), axios.get(this.styleUrl)])
            .then((responses) => {
                if (!this.layer) {
                    // It could be that the layer has been removed meanwhile therefore check for
                    // its existence
                    return
                }
                const geojsonData = responses[0].data
                const geojsonStyleLiterals = responses[1].data
                const style = new OlStyleForPropertyValue(geojsonStyleLiterals)

                // if the GeoJSON describes a CRS (projection) we grab it so that we can reproject on the fly if needed
                const dataProjection = geojsonData.crs ? geojsonData.crs.properties.name : null

                // reprojecting the GeoJSON if not in EPSG:3857, the default projection for GeoJSON is WGS84
                // as stated in the reference https://tools.ietf.org/html/rfc7946#section-4
                // if another projection was set in the GeoJSON (through the "crs" property) we use it instead
                let reprojectedGeoJSON
                if (dataProjection) {
                    if (dataProjection !== CoordinateSystems.WEBMERCATOR.epsg) {
                        reprojectedGeoJSON = reproject(
                            geojsonData,
                            dataProjection,
                            CoordinateSystems.WEBMERCATOR.epsg
                        )
                    } else {
                        // it's already in the correct projection, we don't reproject
                        reprojectedGeoJSON = geojsonData
                    }
                } else {
                    // according to the IETF reference, if nothing is said about the projection used, it should be WGS84
                    reprojectedGeoJSON = reproject(
                        geojsonData,
                        CoordinateSystems.WGS84.epsg,
                        CoordinateSystems.WEBMERCATOR.epsg
                    )
                }
                this.layer.setSource(
                    new VectorSource({
                        features: new GeoJSON().readFeatures(reprojectedGeoJSON),
                    })
                )
                this.layer.setStyle(function (feature, res) {
                    return style.getFeatureStyle(feature, res)
                })
            })
            .catch((error) => {
                log.error(
                    'Error while fetching GeoJSON data/style for layer ' + this.layerId,
                    error
                )
            })
    },
}
</script>
