<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { EditableFeature } from '@/api/features.api'
import { getKmlFromUrl } from '@/api/files.api'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { WEBMERCATOR } from '@/utils/coordinateSystems'
import log from '@/utils/logging'
import KML from 'ol/format/KML'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { mapState } from 'vuex'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

/** Renders a KML file on the map */
export default {
    mixins: [addLayerToMapMixin],
    inject: ['getMap'],
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
        url(newUrl) {
            this.layer.getSource().clear()
            this.loadKml(newUrl)
        },
        opacity(newOpacity) {
            this.layer.setOpacity(newOpacity)
        },
        availableIconSets(availableIconSets) {
            // If we have previously loaded raw kml features, see loadKml(), then
            // add them to the vector source.
            if (this.rawKmlFeatures) {
                this.addFeatures(availableIconSets, this.rawKmlFeatures)
                this.rawKmlFeatures = null
            }
        },
    },
    created() {
        /* We cannot directly let the vectorSource load the URL. We need to run the deserialize
        function on each feature before it is added to the vectorsource, as it may overwrite
        the getExtent() function and a wrong extent causes the features to sometimes disappear
        from the screen.  */
        this.layer = new VectorLayer({
            id: this.layerId,
            opacity: this.opacity,
            source: new VectorSource({ wrapX: true }),
        })
        this.loadKml(this.url)
    },
    unmounted() {
        if (IS_TESTING_WITH_CYPRESS) {
            delete window.kmlLayer
            delete window.kmlLayerUrl
        }
    },
    methods: {
        async loadKml(url) {
            try {
                const kml = await getKmlFromUrl(url)
                const features = new KML().readFeatures(kml, {
                    // Reproject all features to webmercator, as this is the projection used for the view
                    featureProjection: WEBMERCATOR.epsg,
                })
                // We cannot add the KML features without deserializing it and to deserialize we need
                // the icon sets which might not be yet available, therefore we keep the raw kml features
                // in memory when the icon sets is not yet available.
                if (this.availableIconSets && this.availableIconSets.length) {
                    this.addFeatures(this.availableIconSets, features)
                } else {
                    this.rawKmlFeatures = features
                }

                if (IS_TESTING_WITH_CYPRESS) {
                    window.kmlLayer = this.layer
                    window.kmlLayerUrl = url
                }
            } catch (error) {
                log.error(`Failed to load kml from ${url}`, error)
            }
        },
        addFeatures(availableIconSets, features) {
            if (features) {
                features.forEach((olFeature) => {
                    EditableFeature.deserialize(olFeature, availableIconSets)
                })
                // remove all old features first
                this.layer.getSource().clear()
                // add the deserialized features
                this.layer.getSource().addFeatures(features)
            } else {
                log.error(`No KML features available to add`, features)
            }
        },
    },
}
</script>
