<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { getKmlFromUrl } from '@/api/files.api'
import log from '@/utils/logging'
import VectorSource from 'ol/source/Vector'
import { mapState } from 'vuex'
import addPrimitiveLayerMixins from './utils/addPrimitiveLayer-mixins'
import { parseKml } from '@/modules/drawing/lib/drawingUtils'

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
            projection: (state) => state.position.projection,
        }),
    },
    methods: {
        async loadLayer() {
            try {
                const kml = await getKmlFromUrl(this.url)
                const features = parseKml(kml, this.projection, this.availableIconSets)
                if (features) {
                    this.olLayer.setSource(new VectorSource({ wrapX: true }))
                    // remove all old features first
                    this.olLayer.getSource().clear()
                    // add the deserialized features
                    this.olLayer.getSource().addFeatures(features)
                    return this.projection.epsg
                } else {
                    log.error(`No KML features available to add`, features)
                }
            } catch (error) {
                log.error(`Failed to load kml from ${this.url}`, error)
            }
            return undefined
        },
    },
}
</script>
