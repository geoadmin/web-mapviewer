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
import { computed, inject, toRef, toRefs, watch } from 'vue'

import GPXLayer from '@/api/layers/GPXLayer.class'
import { GPX_BILLBOARD_RADIUS } from '@/config/cesium.config'
import useAddDataSourceLayer from '@/modules/map/components/cesium/utils/useAddDataSourceLayer.composable'
import log from '@/utils/logging'

const props = defineProps({
    gpxLayerConfig: {
        type: GPXLayer,
        required: true,
    },
})

const { gpxLayerConfig } = toRefs(props)

const layerId = computed(() => gpxLayerConfig.value.id)
const gpxData = computed(() => gpxLayerConfig.value.gpxData)
const layerOpacity = computed(() => gpxLayerConfig.value.opacity)

const getViewer = inject('getViewer')
const viewer = getViewer()

/** @returns {Promise<GpxDataSource>} */
async function createSource() {
    try {
        return await GpxDataSource.load(
            new Blob([gpxData.value], { type: 'application/gpx+xml' }),
            {
                clampToGround: true,
            }
        )
    } catch (error) {
        log.error(`[Cesium] Error while parsing GPX data for layer ${layerId.value}`, error)
        throw error
    }
}

// Function to create a red circle image using a canvas
function createRedCircleImage(opacity = 1) {
    // Create a new canvas element
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    // Set the canvas sizes
    canvas.width = GPX_BILLBOARD_RADIUS * 2
    canvas.height = GPX_BILLBOARD_RADIUS * 2

    // Draw a red circle on the canvas
    context.beginPath()
    context.arc(
        GPX_BILLBOARD_RADIUS,
        GPX_BILLBOARD_RADIUS,
        GPX_BILLBOARD_RADIUS,
        0,
        2 * Math.PI,
        false
    )
    context.fillStyle = `rgba(255, 0, 0, ${opacity})`
    context.fill()

    // Return the data URL of the canvas drawing
    return canvas.toDataURL()
}

function createRedCircleBillboard(opacity = 1) {
    const redCircleImage = createRedCircleImage(opacity)
    const billboardSize = GPX_BILLBOARD_RADIUS * 2
    return new BillboardGraphics({
        image: redCircleImage,
        width: billboardSize,
        height: billboardSize,
        eyeOffset: new Cartesian3(0, 0, -100), // Make sure the billboard is always seen
        heightReference: HeightReference.CLAMP_TO_TERRAIN, // Make the billboard always appear on top of the terrain
    })
}

function applyStyleToGpxEntity(entity, opacity) {
    const redCircleBillboard = createRedCircleBillboard(opacity)
    const redColorMaterial = new ColorMaterialProperty(Color.RED.withAlpha(opacity))
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
}

const { refreshDataSource } = useAddDataSourceLayer(
    viewer,
    createSource(),
    applyStyleToGpxEntity,
    toRef(layerOpacity),
    toRef(layerId)
)

watch(gpxData, () => refreshDataSource(createSource()))
</script>
<template>
    <slot />
</template>
