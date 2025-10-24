<script setup lang="ts">
import type { GPXLayer } from '@swissgeo/layers'
import type { Entity, Viewer } from 'cesium'

import log from '@swissgeo/log'
import {
    BillboardGraphics,
    Cartesian3,
    Color,
    ColorMaterialProperty,
    ConstantProperty,
    defined as cesiumDefined,
    GpxDataSource,
    HeightReference,
} from 'cesium'
import { computed, inject, toRef, watch } from 'vue'

import { GPX_BILLBOARD_RADIUS } from '@/config/cesium.config'
import useAddDataSourceLayer from '@/modules/map/components/cesium/utils/useAddDataSourceLayer.composable'

const { gpxLayerConfig } = defineProps<{ gpxLayerConfig: GPXLayer }>()

const gpxData = computed(() => gpxLayerConfig.gpxData)
const layerOpacity = computed(() => gpxLayerConfig.opacity)

const viewer = inject<Viewer | undefined>('viewer')
if (!viewer) {
    log.error({
        title: 'CesiumGPXLayer.vue',
        message: ['Viewer not initialized, cannot create GPX layer'],
    })
    throw new Error('Viewer not initialized, cannot create GPX layer')
}

async function createSource(): Promise<GpxDataSource> {
    try {
        return await GpxDataSource.load(
            new Blob([gpxData.value ?? ''], { type: 'application/gpx+xml' }),
            {
                clampToGround: true,
            }
        )
    } catch (error) {
        log.error({
            title: 'CesiumGPXLayer.vue',
            message: [`Could not load GPX ${gpxLayerConfig.id}`, error],
        })
        throw error
    }
}

// Function to create a red circle image using a canvas
function createRedCircleImage(opacity: number = 1): string {
    // Create a new canvas element
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!

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

function createRedCircleBillboard(opacity: number = 1): BillboardGraphics {
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

function applyStyleToGpxEntity(entity: Entity, opacity: number): void {
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
        const pl = entity.polyline
        pl.material = redColorMaterial
        pl.width = new ConstantProperty(3)
    }

    if (cesiumDefined(entity.polygon)) {
        const pg = entity.polygon
        pg.material = redColorMaterial
        pg.outline = new ConstantProperty(true)
        pg.outlineColor = new ConstantProperty(Color.BLACK.withAlpha(opacity))
    }
}

const { refreshDataSource } = useAddDataSourceLayer(
    viewer,
    createSource(),
    applyStyleToGpxEntity,
    toRef(layerOpacity),
    toRef(gpxLayerConfig.id)
)

watch(gpxData, () => refreshDataSource(createSource()))
</script>
<template>
    <slot />
</template>
