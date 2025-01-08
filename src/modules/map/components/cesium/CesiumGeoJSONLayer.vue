<script setup>
import { GeoJsonDataSource } from 'cesium'
import { cloneDeep } from 'lodash'
import { reproject } from 'reproject'
import { computed, inject, toRef, toRefs } from 'vue'

import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import { setEntityStyle } from '@/modules/map/components/cesium/utils/styleConverter'
import useAddDataSourceLayer from '@/modules/map/components/cesium/utils/useAddDataSourceLayer.composable'
import { LV03, LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'

const props = defineProps({
    geoJsonConfig: {
        type: GeoAdminGeoJsonLayer,
        required: true,
    },
})

const { geoJsonConfig } = toRefs(props)

const getViewer = inject('getViewer')
const viewer = getViewer()

const layerId = computed(() => geoJsonConfig.value.id)
const geoJsonData = computed(() => geoJsonConfig.value.geoJsonData)
const geoJsonStyle = computed(() => geoJsonConfig.value.geoJsonStyle)
const opacity = computed(() => geoJsonConfig.value.opacity)

/** @returns {Promise<GeoJsonDataSource>} */
async function createSource() {
    let geoJsonDataInMercator = geoJsonConfig.value.geoJsonData
    if ([LV95.epsg, LV03.epsg].includes(geoJsonData.value?.crs?.properties?.name)) {
        log.debug(`[Cesium] GeoJSON ${layerId.value} is not expressed in WGS84, reprojecting it`)
        const reprojectedData = reproject(
            cloneDeep(geoJsonData.value),
            geoJsonData.value.crs.properties.name,
            WGS84.epsg
        )
        delete reprojectedData.crs
        geoJsonDataInMercator = reprojectedData
    }
    try {
        return await GeoJsonDataSource.load(geoJsonDataInMercator)
    } catch (error) {
        log.error(`[Cesium] Error while parsing GeoJSON data for layer ${layerId.value}`, error)
        throw error
    }
}

useAddDataSourceLayer(
    viewer,
    createSource(),
    (entity, opacity) => setEntityStyle(entity, geoJsonStyle.value, opacity),
    toRef(opacity),
    toRef(layerId)
)
</script>

<template>
    <slot />
</template>
