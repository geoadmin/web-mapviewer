<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { Color, defined as cesiumDefined, GpxDataSource } from 'cesium'
import { ColorMaterialProperty } from 'cesium'

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

            this.gpxDataSource
                .load(gpxUrl, {
                    clampToGround: true,
                })
                .then((dataSource) => {
                    this.getViewer().dataSources.add(dataSource)
                    this.isPresentOnMap = true
                })
                .then(() => this.updateStyle())
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
        updateStyle() {
            // Inspect the default styles
            const entities = this.gpxDataSource.entities.values
            log.debug('Entities:', entities.length)
            window.entities = entities
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i]
                // hacky stuff to draw GPX data like in geoadmin
                log.debug('Entity:', entity)
                if (cesiumDefined(entity.billboard) && !entity.description) {
                    entity.show = false // Hide the billboard for billboard on the lines
                } else {
                    entity.show = true
                }

                if (cesiumDefined(entity.polyline)) {
                    entity.polyline.material = new ColorMaterialProperty(Color.RED)
                    entity.polyline.width = 1.5
                }

                if (cesiumDefined(entity.polygon)) {
                    entity.polygon.material = new ColorMaterialProperty(Color.RED)
                    entity.polygon.outline = true
                    entity.polygon.outlineColor = Color.BLACK
                }
            }
            this.getViewer().scene.requestRender()
        },
    },
}
</script>
