<script setup lang="ts">
import type { GeoAdminGeoJSONLayer } from '@swissgeo/layers'
import type { Viewer } from 'cesium'
import type { Geometry } from 'geojson'
import type { ShallowRef } from 'vue'

import { LV03, LV95, WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { GeoJsonDataSource } from 'cesium'
import { reproject } from 'reproject'
import { computed, inject, toRef } from 'vue'

import { setEntityStyle } from '@/modules/map/components/cesium/utils/geoJsonStyleConverter'
import useAddDataSourceLayer from '@/modules/map/components/cesium/utils/useAddDataSourceLayer.composable'
import { getSafe } from '@/utils/utils'

const { geoJsonConfig } = defineProps<{ geoJsonConfig: GeoAdminGeoJSONLayer }>()

const viewer = inject<ShallowRef<Viewer | undefined>>('viewer')
if (!viewer?.value) {
    log.error({
        title: 'CesiumGeoJSONLayer.vue',
        titleColor: LogPreDefinedColor.Blue,
        messages: ['Viewer not initialized, cannot create GeoJSON layer'],
    })
    throw new Error('Viewer not initialized, cannot create GeoJSON layer')
}

const layerId = computed<string>(() => geoJsonConfig.id)
const geoJsonData = computed<GeoJSON.FeatureCollection | undefined>(() => geoJsonConfig.geoJsonData)
const geoJsonStyle = computed(() => geoJsonConfig.geoJsonStyle)
const opacity = computed(() => geoJsonConfig.opacity)

async function createSource(): Promise<GeoJsonDataSource> {
    let geoJsonDataInMercator: GeoJSON.FeatureCollection | undefined = geoJsonData.value
    let crsName: string | undefined
    const crsEntry = getSafe<object>(geoJsonDataInMercator, 'crs')
    // CRS isn't part of the "standard" anymore, but we might have some old GeoJSON still providing it
    // @see https://datatracker.ietf.org/doc/html/rfc7946#appendix-B.1
    if (crsEntry) {
        const properties = getSafe<object>(crsEntry, 'properties')
        if (properties) {
            crsName = getSafe<string>(properties, 'name')
        }
    }
    if (crsName && [LV95.epsg, LV03.epsg].includes(crsName) && geoJsonData.value) {
        log.debug({
            title: 'CesiumGeoJSONLayer.vue',
            titleColor: LogPreDefinedColor.Blue,
            messages: [`GeoJSON ${layerId.value} is not expressed in WGS84, reprojecting it`],
        })
        const reprojectedData = reproject(geoJsonData.value, crsName, WGS84.epsg)
        if (reprojectedData && typeof reprojectedData === 'object' && 'crs' in reprojectedData) {
            delete (reprojectedData as { crs?: unknown }).crs
        }
        geoJsonDataInMercator = reprojectedData
    }
    try {
        return await GeoJsonDataSource.load(geoJsonDataInMercator)
    } catch (error) {
        log.error({
            title: 'CesiumGeoJSONLayer.vue',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Error while parsing GeoJSON data for layer', layerId.value, error],
        })
        throw error
    }
}

useAddDataSourceLayer(
    viewer,
    createSource(),
    (entity, opacity) => setEntityStyle(entity, geoJsonStyle.value!, opacity),
    toRef(opacity),
    toRef(layerId)
)
</script>

<template>
    <slot />
</template>
