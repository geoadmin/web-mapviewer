<script setup>
import proj4 from 'proj4'
import TIFFImageryProvider from 'tiff-imagery-provider'
import { computed, inject, toRef, toRefs } from 'vue'

import CloudOptimizedGeoTIFFLayer from '@/api/layers/CloudOptimizedGeoTIFFLayer.class'
import useAddImageryLayer from '@/modules/map/components/cesium/utils/useAddImageryLayer.composable'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'

const props = defineProps({
    geotiffConfig: {
        type: CloudOptimizedGeoTIFFLayer,
        required: true,
    },
    zIndex: {
        type: Number,
        default: -1,
    },
})
const { geotiffConfig, zIndex } = toRefs(props)

const getViewer = inject('getViewer')
const viewer = getViewer()

const noDataValue = computed(() => geotiffConfig.value.noDataValue ?? 0)
const fileSource = computed(() => {
    if (geotiffConfig.value.isLocalFile) {
        return geotiffConfig.value.data
    }
    return geotiffConfig.value.fileSource
})
const opacity = computed(() => geotiffConfig.value.opacity)

async function createProvider() {
    return await TIFFImageryProvider.fromUrl(fileSource.value, {
        renderOptions: {
            nodata: noDataValue.value,
        },
        projFunc: (code) => {
            return {
                project: (pos) => proj4(WGS84.epsg, `EPSG:${code}`, pos),
                unproject: (pos) => proj4(`EPSG:${code}`, WGS84.epsg, pos),
            }
        },
    })
}

useAddImageryLayer(viewer, createProvider, toRef(zIndex), toRef(opacity))
</script>

<template>
    <slot />
</template>