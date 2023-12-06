<template>
    <div>
        <slot />
    </div>
</template>

<script>
import axios from 'axios'
import GeoJSON from 'ol/format/GeoJSON'
import { Vector as VectorSource } from 'ol/source'

import OlStyleForPropertyValue from '@/modules/map/components/openlayers/utils/styleFromLiterals'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import allCoordinateSystems from '@/utils/coordinates/coordinateSystems'
import reprojectGeoJsonData from '@/utils/geoJsonUtils'
import log from '@/utils/logging'

import addPrimitiveFromOLLayerMixins from './utils/addPrimitiveFromOLLayer.mixins'

/** Adds a GeoJSON layer to the Cesium viewer */
export default {
    mixins: [addPrimitiveFromOLLayerMixins],
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
        projection: {
            type: CoordinateSystem,
            required: true,
        },
    },
    methods: {
        loadDataInOLLayer() {
            return Promise.all([axios.get(this.geojsonUrl), axios.get(this.styleUrl)])
                .then((responses) => {
                    const geojsonData = responses[0].data
                    const geojsonStyleLiterals = responses[1].data
                    const style = new OlStyleForPropertyValue(geojsonStyleLiterals)
                    const matchingDataProjection = allCoordinateSystems.find(
                        (coordinateSystem) =>
                            coordinateSystem.epsg === geojsonData?.crs?.properties?.name
                    )
                    this.olLayer.setSource(
                        new VectorSource({
                            features: new GeoJSON().readFeatures(
                                reprojectGeoJsonData(
                                    geojsonData,
                                    this.projection,
                                    matchingDataProjection
                                )
                            ),
                        })
                    )
                    this.olLayer.setStyle(function (feature, res) {
                        return style.getFeatureStyle(feature, res)
                    })
                })
                .catch((error) => {
                    log.error(
                        `Error while fetching GeoJSON data/style for layer ${this.layerId}`,
                        error
                    )
                    throw new Error(
                        `Error while fetching GeoJSON data/style for layer ${this.layerId}`
                    )
                })
        },
    },
}
</script>
