<template>
    <div>
        <slot />
    </div>
</template>

<script>
import VectorSource from 'ol/source/Vector'
import { mapState } from 'vuex'

import GPXLayer from '@/api/layers/GPXLayer.class'
import { parseGpx } from '@/utils/gpxUtils'

import addPrimitiveFromOLLayerMixins from './utils/addPrimitiveFromOLLayer.mixins'

/** Adds a GPX layer to the Cesium viewer */
export default {
    mixins: [addPrimitiveFromOLLayerMixins],
    props: {
        gpxLayerConfig: {
            type: GPXLayer,
            required: true,
        },
    },
    computed: {
        ...mapState({
            projection: (state) => state.position.projection,
        }),
        opacity() {
            return this.gpxLayerConfig.opacity
        },
        gpxData() {
            return this.gpxLayerConfig.gpxData
        },
    },
    watch: {
        gpxData() {
            this.loadDataInOLLayer().then(this.addPrimitive)
        },
    },
    methods: {
        loadDataInOLLayer() {
            return new Promise((resolve, reject) => {
                if (!this.gpxData) {
                    reject(new Error('no GPX data loaded yet, could not create source'))
                }
                this.olLayer.setSource(
                    new VectorSource({
                        wrapX: true,
                        projection: this.projection,
                        features: parseGpx(this.gpxData, this.projection),
                    })
                )
                resolve()
            })
        },
    },
}
</script>
