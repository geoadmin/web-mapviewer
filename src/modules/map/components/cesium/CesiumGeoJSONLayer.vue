<script setup>
import { GeoJsonDataSource } from 'cesium'
import { cloneDeep } from 'lodash'
import { reproject } from 'reproject'
import { computed, inject, onMounted, toRefs, watch } from 'vue'

import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import { setEntityStyle } from '@/modules/map/components/cesium/utils/styleConverter'
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

const isLoading = computed(() => geoJsonConfig.value.isLoading)
const geoJsonData = computed(() => geoJsonConfig.value.geoJsonData)
const geoJsonStyle = computed(() => geoJsonConfig.value.geoJsonStyle)
const opacity = computed(() => geoJsonConfig.value.opacity)
const geoJsonDataInMercator = computed(() => {
    if ([LV95.epsg, LV03.epsg].includes(geoJsonData.value?.crs?.properties?.name)) {
        const reprojectedData = reproject(
            cloneDeep(geoJsonData.value),
            geoJsonData.value.crs.properties.name,
            WGS84.epsg
        )
        delete reprojectedData.crs
        return reprojectedData
    }
    return geoJsonConfig.value.geoJsonData
})

onMounted(() => {
    if (!isLoading.value) {
        createSource()
    }
})

watch(isLoading, createSource)
watch(opacity, () => {
    dataSource?.entities.values.forEach((entity) =>
        setEntityStyle(entity, geoJsonStyle.value, opacity.value)
    )
})

let dataSource = null

function createSource() {
    GeoJsonDataSource.load(geoJsonDataInMercator.value)
        .then((loadedData) => {
            dataSource = loadedData
            dataSource.entities.values.forEach((entity) =>
                setEntityStyle(entity, geoJsonStyle.value, opacity.value)
            )
            viewer.dataSources.add(dataSource)
        })
        .catch((error) => {
            log.error('Error while parsing GeoJSON in Cesium', error)
        })
}
</script>

<template>
    <slot />
</template>
