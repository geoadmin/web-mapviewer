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
import { computed } from 'vue'

import GPXLayer from '@/api/layers/GPXLayer.class'
import log from '@/utils/logging'

const props = defineProps({
    gpxLayerConfig: {
        type: GPXLayer,
        required: true,
    },
})

const isPresentOnMap = ref(false)

const opacity = computed(() => props.gpxLayerConfig.opacity)
const gpxData = computed(() => props.gpxLayerConfig.gpxData)

let gpxDataSource = null

const getViewer = inject('getViewer')
watch(gpxData, () => {
    removeLayer()
    addLayer()
})

watch(opacity, () => {
    updateStyle()
})

onMounted(() => {
    log.debug('Mounted GPX layer')
    addLayer()
})

onUnmounted(() => {
    log.debug('Unmounted GPX layer')
    if (gpxDataSource && isPresentOnMap.value) {
        removeLayer()
    }

    gpxDataSource = null
})

function addLayer() {
    const gpxBlob = new Blob([gpxData.value], { type: 'application/gpx+xml' })
    gpxDataSource = new GpxDataSource()
    gpxDataSource
        .load(gpxBlob, {
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
    if (gpxDataSource) {
        getViewer().dataSources.remove(gpxDataSource)
        gpxDataSource = null
        getViewer().scene.requestRender() // Request a render after removing the DataSource
    }
    isPresentOnMap.value = false
}

// Function to create a red circle image using a canvas
function createRedCircleImage(radius, opacity = 1) {
    // Create a new canvas element
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    // Set the canvas sizes
    canvas.width = radius * 2
    canvas.height = radius * 2

    // Draw a red circle on the canvas
    context.beginPath()
    context.arc(radius, radius, radius, 0, 2 * Math.PI, false)

    const color = `rgba(255, 0, 0, ${opacity})`
    context.fillStyle = color
    context.fill()

    // Return the data URL of the canvas drawing
    return canvas.toDataURL()
}

function updateStyle() {
    // Create a red circle image with a radius of 8 pixels
    const radius = 8
    const billboardSize = radius * 2
    const redCircleImage = createRedCircleImage(radius, opacity.value)

    const redCircleBillboard = new BillboardGraphics({
        image: redCircleImage,
        width: billboardSize,
        height: billboardSize,
        eyeOffset: new Cartesian3(0, 0, -100), // Make sure the billboard is always seen
        heightReference: HeightReference.CLAMP_TO_TERRAIN, // Make the billboard always appear on top of the terrain
    })
    const redColorMaterial = new ColorMaterialProperty(Color.RED.withAlpha(opacity.value))

    const entities = gpxDataSource.entities.values

    entities.forEach((entity) => {
        if (opacity.value === 0) {
            entity.show = false
            return
        }
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
            entity.show = true
            entity.polyline.material = redColorMaterial
            entity.polyline.width = 1.5
        }

        if (cesiumDefined(entity.polygon)) {
            entity.show = true
            entity.polygon.material = redColorMaterial
            entity.polygon.outline = true
            entity.polygon.outlineColor = Color.BLACK
        }
    })
    getViewer().scene.requestRender()
}
</script>
<template>
    <slot />
</template>
