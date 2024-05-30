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
            gpxDataSource: null,
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
        const gpxUrl =
            'https://gist.githubusercontent.com/ismailsunni/e4345dd852c5deaff3434eadefdb467f/raw/0eac92b199e10c6498f4a1c305098a3e74ce1521/map.geo.admin.ch_GPX_20240529033356.gpx'
        GpxDataSource.load(gpxUrl, {
            clampToGround: true,
        }).then((dataSource) => {
            this.gpxDataSource = dataSource
            if (!this.isPresentOnMap) {
                this.addLayer()
            }
        })
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
            log.debug('Adding GPX layer')
            log.debug(this.gpxDataSource)
            this.getViewer().dataSources.add(this.gpxDataSource)
            this.isPresentOnMap = true
            log.debug(this.getViewer().dataSources)
        },
        removeLayer() {
            log.debug('Remove GPX layer')
            log.debug(this.gpxDataSource)
            if (this.gpxDataSource) {
                this.getViewer().dataSources.remove(this.gpxDataSource)
                this.gpxDataSource = null
                this.getViewer().scene.requestRender() // Request a render after removing the DataSource
            }
            this.isPresentOnMap = false
            log.debug(this.getViewer().dataSources)
        },
    },
}
</script>
