<template>
    <div>
        <slot />
    </div>
</template>

<script>
import {
    BillboardGraphics,
    Cartesian3,
    Color,
    ColorMaterialProperty,
    defined as cesiumDefined,
    GpxDataSource,
    HeightReference,
} from 'cesium'

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
            // Function to create a red circle image using a canvas
            function createRedCircleImage(radius) {
                // Create a new canvas element
                const canvas = document.createElement('canvas')
                const context = canvas.getContext('2d')

                // Set the canvas sizes
                canvas.width = radius * 2
                canvas.height = radius * 2

                // Draw a red circle on the canvas
                context.beginPath()
                context.arc(radius, radius, radius, 0, 2 * Math.PI, false)
                context.fillStyle = 'red'
                context.fill()

                // Return the data URL of the canvas drawing
                return canvas.toDataURL()
            }

            // Create a red circle image with a radius of 8 pixels
            const radius = 8
            const billboardSize = radius * 2
            const redCircleImage = createRedCircleImage(radius)

            const entities = this.gpxDataSource.entities.values
            log.debug('Entities:', entities.length)
            window.entities = entities
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i]
                // Hide the billboard for billboard on the lines by checking if there is a description
                // Imported GPX files from web-mapviewer have a description for the waypoints
                // This might be not working for generic GPX files
                if (cesiumDefined(entity.billboard)) {
                    if (!entity.description) {
                        entity.show = false
                    } else {
                        entity.show = true
                        entity.billboard = new BillboardGraphics({
                            image: redCircleImage,
                            width: billboardSize,
                            height: billboardSize,
                            eyeOffset: new Cartesian3(0, 0, -100), // Make sure the billboard is always seen
                            heightReference: HeightReference.CLAMP_TO_TERRAIN, // Make the billboard always appear on top of the terrain
                        })
                    }
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
