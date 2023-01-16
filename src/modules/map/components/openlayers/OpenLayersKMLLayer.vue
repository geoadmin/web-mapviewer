<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { EditableFeature } from '@/api/features.api'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { CoordinateSystems } from '@/utils/coordinateUtils'
import KML from 'ol/format/KML'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { mapState } from 'vuex'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'
import { getKmlFromUrl } from '@/api/files.api'

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
        projection: {
            type: String,
            default: CoordinateSystems.WEBMERCATOR.epsg,
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
            this.updateFeatures(availableIconSets)
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
            const kml = await getKmlFromUrl(url)
            const features = new KML().readFeatures(kml, {
                // Reproject all features to webmercator, as this is the projection used for the view
                featureProjection: CoordinateSystems.WEBMERCATOR.epsg,
            })
            this.layer.getSource().addFeatures(features)
            if (this.availableIconSets && this.availableIconSets.length) {
                this.updateFeatures(this.availableIconSets)
            }

            if (IS_TESTING_WITH_CYPRESS) {
                window.kmlLayer = this.layer
                window.kmlLayerUrl = url
            }
        },
        updateFeatures(availableIconSets) {
            this.layer.getSource().forEachFeature((feature) => {
                EditableFeature.deserialize(feature, availableIconSets)
            })
        },
    },
}
</script>
