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
import { onBeforeUnmount, onMounted, toRefs, watch } from 'vue'
import { inject } from 'vue'
import { computed } from 'vue'

import GPXLayer from '@/api/layers/GPXLayer.class'

const props = defineProps({
    gpxLayerConfig: {
        type: GPXLayer,
        required: true,
    },
})

const { gpxLayerConfig } = toRefs(props)

const gpxData = computed(() => gpxLayerConfig.value.gpxData)
const opacity = computed(() => gpxLayerConfig.value.opacity)

const getViewer = inject('getViewer')

onMounted(addGpxLayer)
onBeforeUnmount(removeGpxLayer)

watch(gpxData, addGpxLayer)
watch(opacity, applyStyleToGpxEntities)

let gpxDataSource = null

function removeGpxLayer() {
    if (gpxDataSource) {
        const viewer = getViewer()
        viewer.dataSources.remove(gpxDataSource)
        viewer.scene.requestRender()
        gpxDataSource = null
    }
}

function addGpxLayer() {
    removeGpxLayer()
    if (gpxData.value) {
        new GpxDataSource()
            .load(new Blob([gpxData.value], { type: 'application/gpx+xml' }), {
                clampToGround: true,
            })
            .then((dataSource) => {
                gpxDataSource = dataSource
                applyStyleToGpxEntities()
                const viewer = getViewer()
                viewer.dataSources.add(dataSource)
                viewer.scene.requestRender()
            })
    }
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
    context.fillStyle = `rgba(255, 0, 0, ${opacity})`
    context.fill()

    // Return the data URL of the canvas drawing
    return canvas.toDataURL()
}

function createRedCircleBillboard(radius, opacity = 1) {
    const redCircleImage = createRedCircleImage(radius, opacity)
    const billboardSize = radius * 2
    return new BillboardGraphics({
        image: redCircleImage,
        width: billboardSize,
        height: billboardSize,
        eyeOffset: new Cartesian3(0, 0, -100), // Make sure the billboard is always seen
        heightReference: HeightReference.CLAMP_TO_TERRAIN, // Make the billboard always appear on top of the terrain
    })
}

function applyStyleToGpxEntities() {
    const radius = 8
    const redCircleBillboard = createRedCircleBillboard(radius, opacity.value)
    const redColorMaterial = new ColorMaterialProperty(Color.RED.withAlpha(opacity.value))

    const entities = gpxDataSource.entities.values
    entities.forEach((entity) => {
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
            entity.polyline.material = redColorMaterial
            entity.polyline.width = 3
        }

        if (cesiumDefined(entity.polygon)) {
            entity.polygon.material = redColorMaterial
            entity.polygon.outline = true
            entity.polygon.outlineColor = Color.BLACK.withAlpha(opacity.value)
        }
    })
    getViewer().scene.requestRender()
}
</script>
<template>
    <slot />
</template>
