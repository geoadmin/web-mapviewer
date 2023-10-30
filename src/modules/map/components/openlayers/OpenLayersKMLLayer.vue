<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { getKmlFromUrl } from '@/api/files.api'
import { DEFAULT_PROJECTION, IS_TESTING_WITH_CYPRESS } from '@/config'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import log from '@/utils/logging'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { mapState } from 'vuex'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'
import { parseKml } from '@/modules/drawing/lib/drawingUtils'

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
            type: CoordinateSystem,
            required: true,
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
            this.loadKml(newUrl)
        },
        opacity(newOpacity) {
            this.layer.setOpacity(newOpacity)
        },
        availableIconSets(availableIconSets) {
            // If we have previously loaded raw kml features, see loadKml(), then
            // add them to the vector source.
            if (this.rawKml) {
                const features = parseKml(this.rawKml, this.projection, availableIconSets)
                this.addFeatures(features)
                this.rawKml = null
            }
        },
        projection() {
            this.loadKml(this.url)
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
        })
        this.loadKml(this.url)
        if (IS_TESTING_WITH_CYPRESS) {
            window.kmlLayer = this.layer
            window.kmlLayerUrl = this.url
        }
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
                this.rawKml = await getKmlFromUrl(url)

                // We cannot add the KML features without deserializing it and to deserialize we need
                // the icon sets which might not be yet available, therefore we keep the raw kml features
                // in memory when the icon sets is not yet available.
                if (this.availableIconSets?.length) {
                    const features = parseKml(this.rawKml, this.projection, this.availableIconSets)
                    this.addFeatures(features)
                }
            } catch (error) {
                log.error(`Failed to load kml from ${url}`, error)
            }
        },
        addFeatures(features) {
            if (features) {
                this.layer.setSource(
                    new VectorSource({ wrapX: true, projection: this.projection.epsg })
                )
                this.layer.getSource().addFeatures(features)
            } else {
                log.error(`No KML features available to add`, features)
            }
        },
    },
}
</script>
