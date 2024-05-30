<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { GpxDataSource } from 'cesium'

import GPXLayer from '@/api/layers/GPXLayer.class'
import log from '@/utils/logging'

/** Adds a GPX layer to the Cesium viewer */
export default {
    inject: ['getViewer'],

    props: {
        gpxLayerConfig: {
            type: GPXLayer,
            required: true,
        },
    },

    data() {
        return {
            isPresentOnMap: false,
            gpxDataSource: new GpxDataSource(),
        }
    },

    computed: {
        opacity() {
            return this.gpxLayerConfig.opacity
        },
        gpxData() {
            return this.gpxLayerConfig.gpxData
        },
    },

    watch: {
        gpxData() {
            this.addLayer()
        },
    },

    mounted() {
        log.debug('Mounted GPX layer')
        this.addLayer()
    },

    unmounted() {
        log.debug('Unmounted GPX layer')
        if (this.gpxDataSource && this.isPresentOnMap) {
            this.removeLayer()
        }

        delete this.gpxDataSource
    },

    methods: {
        addLayer() {
            const gpxBlob = new Blob([this.gpxData], { type: 'application/gpx+xml' })
            const gpxUrl = URL.createObjectURL(gpxBlob)

            this.gpxDataSource.load(gpxUrl, {
                clampToGround: true,
            })

            this.getViewer().dataSources.add(this.gpxDataSource)
            this.isPresentOnMap = true
        },
        removeLayer() {
            log.debug('Remove GPX layer')
            if (this.gpxDataSource) {
                this.getViewer().dataSources.remove(this.gpxDataSource)
                this.gpxDataSource = null
                this.getViewer().scene.requestRender() // Request a render after removing the DataSource
            }
            this.isPresentOnMap = false
        },
    },
}
</script>
