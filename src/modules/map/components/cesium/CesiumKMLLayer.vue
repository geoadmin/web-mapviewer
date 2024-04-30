<template>
    <slot />
</template>

<script>
import VectorSource from 'ol/source/Vector'
import { mapActions, mapState } from 'vuex'

import KMLLayer from '@/api/layers/KMLLayer.class'
import { parseKml } from '@/utils/kmlUtils'

import addPrimitiveFromOLLayerMixins from './utils/addPrimitiveFromOLLayer.mixins'

const dispatcher = { dispatcher: 'CesiumKMLLayer.vue' }

/** Renders a KML file to the Cesium viewer */
export default {
    mixins: [addPrimitiveFromOLLayerMixins],
    props: {
        kmlLayerConfig: {
            type: KMLLayer,
            required: true,
        },
    },
    computed: {
        ...mapState({
            availableIconSets: (state) => state.drawing.iconSets,
            projection: (state) => state.position.projection,
        }),
        opacity() {
            return this.kmlLayerConfig.opacity
        },
        kmlData() {
            return this.kmlLayerConfig.kmlData
        },
        iconsArePresent() {
            return this.availableIconSets.length > 0
        },
    },
    watch: {
        iconsArePresent() {
            this.loadDataInOLLayer().then(this.addPrimitive)
        },
        kmlData() {
            this.loadDataInOLLayer().then(this.addPrimitive)
        },
    },
    mounted() {
        if (!this.iconsArePresent) {
            this.loadAvailableIconSets(dispatcher)
        }
    },
    methods: {
        ...mapActions(['loadAvailableIconSets']),
        loadDataInOLLayer() {
            return new Promise((resolve, reject) => {
                if (!this.kmlData) {
                    reject(new Error('no KML data loaded yet, could not create source'))
                }
                if (!this.iconsArePresent) {
                    reject(new Error('no icons loaded yet, could not create source'))
                }
                this.olLayer.setSource(
                    new VectorSource({
                        wrapX: true,
                        projection: this.projection.epsg,
                        features: parseKml(
                            this.kmlLayerConfig,
                            this.projection,
                            this.availableIconSets
                        ),
                    })
                )
                resolve()
            })
        },
    },
}
</script>
