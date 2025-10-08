<script setup lang="ts">
import { LV03, LV95, WGS84 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import { GeoJsonDataSource, type Viewer } from 'cesium'
import { cloneDeep } from 'lodash'
import { reproject } from 'reproject'
import { computed, inject, toRef } from 'vue'

import { setEntityStyle } from '@/modules/map/components/cesium/utils/geoJsonStyleConverter'
import useAddDataSourceLayer from '@/modules/map/components/cesium/utils/useAddDataSourceLayer.composable'
import type { GeoAdminGeoJSONLayer } from '@swissgeo/layers'
import type { Geometry } from 'geojson'

const { geoJsonConfig } = defineProps<{ geoJsonConfig: GeoAdminGeoJSONLayer }>()

const getViewer = inject<() => Viewer | undefined>('getViewer')
const viewer = getViewer?.()

const layerId = computed(() => geoJsonConfig.id)
const geoJsonData = computed(() => geoJsonConfig.geoJsonData)
const geoJsonStyle = computed(() => geoJsonConfig.geoJsonStyle)
const opacity = computed(() => geoJsonConfig.opacity)

async function createSource(): Promise<GeoJsonDataSource> {
    let geoJsonDataInMercator = geoJsonConfig.geoJsonData
    const geoJsonObject =
        typeof geoJsonData.value === 'string' ? JSON.parse(geoJsonData.value) : geoJsonData.value
    const crsName: string | undefined = geoJsonObject?.crs?.properties?.name
    if (crsName && [LV95.epsg, LV03.epsg].includes(crsName)) {
        log.debug(`[Cesium] GeoJSON ${layerId.value} is not expressed in WGS84, reprojecting it`)
        const reprojectedData = reproject(
            cloneDeep(geoJsonData.value as unknown as Geometry),
            crsName,
            WGS84.epsg
        )
        if (reprojectedData && typeof reprojectedData === 'object') {
            if (
                reprojectedData &&
                typeof reprojectedData === 'object' &&
                'crs' in reprojectedData
            ) {
                delete (reprojectedData as { crs?: unknown }).crs
            }
        }
        geoJsonDataInMercator = JSON.stringify(reprojectedData)
    }
    try {
        return await GeoJsonDataSource.load(geoJsonDataInMercator)
    } catch (error: unknown) {
        log.error(
            `[Cesium] Error while parsing GeoJSON data for layer ${layerId.value}`,
            error as string
        )
        throw error
    }
}

useAddDataSourceLayer(
    viewer!,
    createSource(),
    (entity, opacity) => setEntityStyle(entity, geoJsonStyle.value!, opacity),
    toRef(opacity),
    toRef(layerId)
)
</script>

<template>
    <slot />
</template>
