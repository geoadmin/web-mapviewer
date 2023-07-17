<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { PrimitiveCollection } from 'cesium'
import axios from 'axios'
import OlStyleForPropertyValue from '@/modules/map/components/openlayers/utils/styleFromLiterals'
import FeatureConverter from 'ol-cesium/src/olcs/FeatureConverter'
import GeoJSON from 'ol/format/GeoJSON'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { updateCollectionOpacity } from '@/modules/map/components/cesium/utils/geoJsonUtils'
import addLayerToViewer from '@/modules/map/components/cesium/utils/addLayerToViewer-mixins'
import log from '@/utils/logging'
import { IS_TESTING_WITH_CYPRESS } from '@/config'

const STYLE_RESOLUTION = 100

/** Adds a GeoJSON layer to the Cesium viewer */
export default {
    mixins: [addLayerToViewer],
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
        addLayer(layer) {
            this.getViewer().scene.primitives.add(layer)
            this.isPresentOnMap = true
        },
        removeLayer(layer) {
            const viewer = this.getViewer()
            layer.removeAll()
            viewer.scene.primitives.remove(layer)
            viewer.scene.requestRender()
            this.isPresentOnMap = false
        },
    },
    watch: {
        opacity(newOpacity) {
            updateCollectionOpacity(this.layer, newOpacity)
            this.getViewer().scene.requestRender()
        },
    },
    created() {
        const scene = this.getViewer().scene
        this.layer = new PrimitiveCollection()
        const featureConverter = new FeatureConverter(scene)
        const olLayer = new VectorLayer({
            id: this.layerId,
            opacity: this.opacity,
            properties: { altitudeMode: 'clampToGround' },
        })
        Promise.all([axios.get(this.geojsonUrl), axios.get(this.styleUrl)])
            .then((responses) => {
                const geojsonData = responses[0].data
                const geojsonStyleLiterals = responses[1].data
                const style = new OlStyleForPropertyValue(geojsonStyleLiterals)
                olLayer.setSource(
                    new VectorSource({
                        features: new GeoJSON().readFeatures(geojsonData),
                    })
                )
                olLayer.setStyle(function (feature, res) {
                    return style.getFeatureStyle(feature, res)
                })
                const counterpart = featureConverter.olVectorLayerToCesium(
                    olLayer,
                    {
                        getProjection: () =>
                            geojsonData.crs ? geojsonData.crs.properties.name : null,
                        getResolution: () => STYLE_RESOLUTION,
                    },
                    {}
                )
                // need to wait for terrain loaded otherwise primitives will be placed wrong
                if (this.layer) {
                    if (scene.globe.tilesLoaded || IS_TESTING_WITH_CYPRESS) {
                        this.layer.add(counterpart.getRootPrimitive())
                        updateCollectionOpacity(this.layer, this.opacity)
                        this.getViewer().scene.requestRender()
                    } else {
                        const unlisten = scene.globe.tileLoadProgressEvent.addEventListener(
                            (queueLength) => {
                                if (scene.globe.tilesLoaded && queueLength === 0) {
                                    this.layer.add(counterpart.getRootPrimitive())
                                    updateCollectionOpacity(this.layer, this.opacity)
                                    this.getViewer().scene.requestRender()
                                    unlisten()
                                }
                            }
                        )
                    }
                }
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
