<script setup>
import {
    BillboardGraphics,
    Cartesian3,
    Color,
    ColorMaterialProperty,
    defined as cesiumDefined,
    GpxDataSource,
    HeightReference,
} from 'cesium'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { inject } from 'vue'

import GPXLayer from '@/api/layers/GPXLayer.class'
import log from '@/utils/logging'

const props = defineProps({
    gpxLayerConfig: {
        type: GPXLayer,
        required: true,
    },
})

const isPresentOnMap = ref(false)
const gpxDataSource = ref(new GpxDataSource())

const opacity = ref(props.gpxLayerConfig.opacity)
const gpxData = ref(props.gpxLayerConfig.gpxData)

const getViewer = inject('getViewer')
watch(gpxData, () => {
    addLayer()
})

watch(
    () => props.gpxLayerConfig.opacity,
    (newOpacity) => {
        opacity.value = newOpacity
        updateStyle()
    }
)

onMounted(() => {
    log.debug('Mounted GPX layer')
    addLayer()
})

onUnmounted(() => {
    log.debug('Unmounted GPX layer')
    if (gpxDataSource.value && isPresentOnMap.value) {
        removeLayer()
    }

    gpxDataSource.value = null
})

function addLayer() {
    const gpxBlob = new Blob([gpxData.value], { type: 'application/gpx+xml' })
    const gpxUrl = URL.createObjectURL(gpxBlob)

    gpxDataSource.value
        .load(gpxUrl, {
            clampToGround: true,
        })
        .then((dataSource) => {
            getViewer().dataSources.add(dataSource)
            isPresentOnMap.value = true
        })
        .then(updateStyle)
}

function removeLayer() {
    log.debug('Remove GPX layer')
    if (gpxDataSource.value) {
        getViewer().dataSources.remove(gpxDataSource.value)
        gpxDataSource.value = null
        getViewer().scene.requestRender() // Request a render after removing the DataSource
    }
    isPresentOnMap.value = false
}

function updateStyle() {
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

        const color = `rgba(255, 0, 0, ${opacity.value})`
        context.fillStyle = color
        context.fill()

        // Return the data URL of the canvas drawing
        return canvas.toDataURL()
    }

    // Create a red circle image with a radius of 8 pixels
    const radius = 8
    const billboardSize = radius * 2
    const redCircleImage = createRedCircleImage(radius)

    const redCircleBillboard = new BillboardGraphics({
        image: redCircleImage,
        width: billboardSize,
        height: billboardSize,
        eyeOffset: new Cartesian3(0, 0, -100), // Make sure the billboard is always seen
        heightReference: HeightReference.CLAMP_TO_TERRAIN, // Make the billboard always appear on top of the terrain
    })

    const entities = gpxDataSource.value._entityCollection.values

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
                entity.billboard = redCircleBillboard
            }
        }

        if (cesiumDefined(entity.polyline)) {
            entity.polyline.material = new ColorMaterialProperty(Color.RED.withAlpha(opacity.value))
            entity.polyline.width = 1.5
        }

        if (cesiumDefined(entity.polygon)) {
            entity.polygon.material = new ColorMaterialProperty(Color.RED.withAlpha(opacity.value))
            entity.polygon.outline = true
            entity.polygon.outlineColor = Color.BLACK
        }
    }
    getViewer().scene.requestRender()
}
</script>
<template>
    <div>
        <slot />
    </div>
</template>
