<script setup>
import { GeoJsonDataSource } from 'cesium'
import { cloneDeep } from 'lodash'
import { reproject } from 'reproject'
import { computed, inject, onMounted, toRefs } from 'vue'

import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import { setEntityStyle } from '@/modules/map/components/cesium/utils/styleConverter'
import { LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging.js'

const props = defineProps({
    geoJsonConfig: {
        type: GeoAdminGeoJsonLayer,
        required: true,
    },
})

const { geoJsonConfig } = toRefs(props)

const getViewer = inject('getViewer')
const viewer = getViewer()

const geoJsonData = computed(() => geoJsonConfig.value.geoJsonData)
const geoJsonStyle = computed(() => geoJsonConfig.value.geoJsonStyle)
const geoJsonDataInMercator = computed(() => {
    if (geoJsonData.value?.crs?.properties?.name === LV95.epsg) {
        const reprojectedData = reproject(cloneDeep(geoJsonData.value), LV95.epsg, WGS84.epsg)
        delete reprojectedData.crs
        return reprojectedData
    }
    return geoJsonConfig.value.geoJsonData
})

onMounted(() => {
    GeoJsonDataSource.load(geoJsonDataInMercator.value)
        .then((loadedData) => {
            loadedData.entities.values.forEach((entity) =>
                setEntityStyle(entity, geoJsonStyle.value)
            )
            viewer.dataSources.add(loadedData)
        })
        .catch((error) => {
            log.error('Error while parsing GeoJSON in Cesium', error)
        })
})
</script>

<template>
    <slot />
</template>
