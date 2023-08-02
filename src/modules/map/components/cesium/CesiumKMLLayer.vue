<template>
    <div>
        <slot />
    </div>
</template>

<script>
import log from '@/utils/logging'
import { getKmlFromUrl } from '@/api/files.api'
import KML from 'ol/format/KML'
import { WEBMERCATOR } from '@/utils/coordinateSystems'
import { EditableFeature } from '@/api/features.api'
import VectorSource from 'ol/source/Vector'
import { mapState } from 'vuex'
import addPrimitiveLayerMixins from './utils/addPrimitiveLayer-mixins'

/** Renders a KML file to the Cesium viewer */
export default {
    mixins: [addPrimitiveLayerMixins],
    props: {
        layerId: {
            type: String,
            required: true,
        },
        url: {
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
    computed: {
        ...mapState({
            availableIconSets: (state) => state.drawing.iconSets,
        }),
    },
    watch: {
        url() {
            this.olLayer.getSource().clear()
            this.removeLayer(this.layer)
            this.loadLayer()
        },
    },
    methods: {
        async loadLayer() {
            try {
                const kml = await getKmlFromUrl(this.url)
                const features = new KML().readFeatures(kml, {
                    // Reproject all features to webmercator, as this is the projection used for the view
                    featureProjection: WEBMERCATOR.epsg,
                })
                if (features) {
                    this.olLayer.setSource(new VectorSource({ wrapX: true }))
                    features.forEach((olFeature) => {
                        EditableFeature.deserialize(olFeature, this.availableIconSets)
                    })
                    // remove all old features first
                    this.olLayer.getSource().clear()
                    // add the deserialized features
                    this.olLayer.getSource().addFeatures(features)
                    this.addPrimitive(WEBMERCATOR.epsg)
                } else {
                    log.error(`No KML features available to add`, features)
                }
            } catch (error) {
                log.error(`Failed to load kml from ${this.url}`, error)
            }
        },
    },
}
</script>
