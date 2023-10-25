<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { DEFAULT_PROJECTION } from '@/config'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import allCoordinateSystems from '@/utils/coordinates/coordinateSystems'
import reprojectGeoJsonData from '@/utils/geoJsonUtils'
import log from '@/utils/logging'
import axios from 'axios'
import GeoJSON from 'ol/format/GeoJSON'
import { Vector as VectorLayer } from 'ol/layer'
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
        projection: {
            type: CoordinateSystem,
            default: DEFAULT_PROJECTION,
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
        projection() {
            this.createSourceForProjection()
        },
    },
    created() {
        // The layers need to be set immediately. Otherwise, addLayerToMapMixin will fail.
        this.layer = new VectorLayer({ id: this.layerId, opacity: this.opacity })

        // loading the GeoJSON data and style with and wait for both the be loaded
        // WARNING: axios.get(this.styleUrl) will not work on localhost and will fire a CORS error !!
        // this is due to the fact that the backend send the styleUrl agnostic without HTTP scheme !
        Promise.all([this.loadStyle(), this.loadData()])
            .then(() => {
                if (!this.layer) {
                    // It could be that the layer has been removed meanwhile therefore check for
                    // its existence
                    return
                }
                this.layer.setStyle((feature, res) => {
                    return this.geojsonStyle.getFeatureStyle(feature, res)
                })
                this.createSourceForProjection()
            })
            .catch((error) => {
                log.error(
                    `Error while fetching GeoJSON data/style for layer ${this.layerId}`,
                    error
                )
            })
    },
    methods: {
        loadStyle() {
            return new Promise((resolve, reject) => {
                axios
                    .get(this.styleUrl)
                    .then((response) => response.data)
                    .then((style) => {
                        this.geojsonStyle = new OlStyleForPropertyValue(style)
                        resolve(this.geojsonStyle)
                    })
                    .catch((error) => {
                        log.error(
                            `Error while loading GeoJSON style for layer ${this.layerId}`,
                            error
                        )
                        reject()
                    })
            })
        },
        loadData() {
            return new Promise((resolve, reject) => {
                axios
                    .get(this.geojsonUrl)
                    .then((response) => response.data)
                    .then((data) => {
                        this.geojsonData = data
                        resolve(this.geojsonData)
                    })
                    .catch((error) => {
                        log.error(
                            `Error while fetching GeoJSON data for layer ${this.layerId}`,
                            error
                        )
                        reject()
                    })
            })
        },
        createSourceForProjection() {
            if (!this.geojsonData) {
                log.error('no GeoJSON data loaded yet, could not create source')
                return
            }
            if (!this.geojsonStyle) {
                log.error('style was not loaded, could not create source')
                return
            }
            // if the GeoJSON describes a CRS (projection) we grab it so that we can reproject on the fly if needed
            const matchingDataProjection = allCoordinateSystems.find(
                (coordinateSystem) =>
                    coordinateSystem.epsg === this.geojsonData?.crs?.properties?.name
            )
            this.layer.setSource(
                new VectorSource({
                    features: new GeoJSON().readFeatures(
                        reprojectGeoJsonData(
                            this.geojsonData,
                            this.projection,
                            matchingDataProjection
                        )
                    ),
                })
            )
        },
    },
}
</script>
