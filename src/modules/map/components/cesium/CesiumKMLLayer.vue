<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { getKmlFromUrl } from '@/api/files.api'
import { parseKml } from '@/modules/drawing/lib/drawingUtils'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import log from '@/utils/logging'
import VectorSource from 'ol/source/Vector'
import { mapState } from 'vuex'
import addPrimitiveFromOLLayerMixins from './utils/addPrimitiveFromOLLayer.mixins'

/** Renders a KML file to the Cesium viewer */
export default {
    mixins: [addPrimitiveFromOLLayerMixins],
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
    },
    computed: {
        ...mapState({
            availableIconSets: (state) => state.drawing.iconSets,
        }),
    },
    methods: {
        async loadDataInOLLayer() {
            try {
                const kml = await getKmlFromUrl(this.url)
                const features = parseKml(kml, this.projection, this.availableIconSets)
                if (features) {
                    this.olLayer.setSource(
                        new VectorSource({ wrapX: true, projection: this.projection.epsg })
                    )
                    // remove all old features first
                    this.olLayer.getSource().clear()
                    // add the deserialized features
                    this.olLayer.getSource().addFeatures(features)
                } else {
                    log.error(`No KML features available to add`, features)
                }
            } catch (error) {
                log.error(`Failed to load kml from ${this.url}`, error)
                throw error
            }
        },
    },
}
</script>
