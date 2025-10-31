<script setup lang="ts">
import type { GeoAdminGeoJSONLayer } from '@swissgeo/layers'
import type { GeoJSON, Geometry } from 'geojson'

import { LV03, LV95, WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { GeoJsonDataSource, type Viewer } from 'cesium'
import { cloneDeep } from 'lodash'
import { reproject } from 'reproject'
import { computed, inject, type Ref, toRef } from 'vue'

import { setEntityStyle } from '@/modules/map/components/cesium/utils/geoJsonStyleConverter'
import useAddDataSourceLayer from '@/modules/map/components/cesium/utils/useAddDataSourceLayer.composable'
import { getSafe } from '@/utils/utils'

const { geoJsonConfig } = defineProps<{ geoJsonConfig: GeoAdminGeoJSONLayer }>()

const viewer = inject<Ref<Viewer | undefined>>('viewer')
if (!viewer) {
    log.error({
        title: 'CesiumGeoJSONLayer.vue',
        titleColor: LogPreDefinedColor.Blue,
        message: ['Viewer not initialized, cannot create GeoJSON layer'],
    })
    throw new Error('Viewer not initialized, cannot create GeoJSON layer')
}

const layerId = computed<string>(() => geoJsonConfig.id)
const geoJsonData = computed<string | undefined>(() => geoJsonConfig.geoJsonData)
const geoJsonObject = computed<GeoJSON | undefined>(() => {
    if (geoJsonData.value) {
        return cloneDeep<GeoJSON>(JSON.parse(geoJsonData.value))
    }
    return undefined
})
const geoJsonStyle = computed(() => geoJsonConfig.geoJsonStyle)
const opacity = computed(() => geoJsonConfig.opacity)

async function createSource(): Promise<GeoJsonDataSource> {
    let geoJsonDataInMercator = geoJsonConfig.geoJsonData
    let crsName: string | undefined

    const crsEntry = getSafe<object>(geoJsonObject, 'crs')
    // CRS isn't part of the "standard" anymore, but we might have some old GeoJSON still providing it
    // @see https://datatracker.ietf.org/doc/html/rfc7946#appendix-B.1
    if (crsEntry) {
        const properties = getSafe<object>(crsEntry, 'properties')
        if (properties) {
            crsName = getSafe<string>(properties, 'name')
        }
    }
    if (crsName && [LV95.epsg, LV03.epsg].includes(crsName)) {
        log.debug({
            title: 'CesiumGeoJSONLayer.vue',
            titleColor: LogPreDefinedColor.Blue,
            message: [`GeoJSON ${layerId.value} is not expressed in WGS84, reprojecting it`],
        })
        const reprojectedData = reproject(geoJsonObject.value as Geometry, crsName, WGS84.epsg)
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
    } catch (error) {
        log.error({
            title: 'CesiumGeoJSONLayer.vue',
            titleColor: LogPreDefinedColor.Red,
            message: ['Error while parsing GeoJSON data for layer', layerId.value, error],
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
