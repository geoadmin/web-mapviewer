<script setup>
import { inject } from 'vue'

import GeoAdmin3DLayer from '@/api/layers/GeoAdmin3DLayer.class'
import useSwissnamesLabelsRenderer from '@/modules/map/components/cesium/utils/useSwissnamesLabelsRenderer.composable'

const { layerConfig } = defineProps({
    layerConfig: {
        type: GeoAdmin3DLayer,
        required: true,
    },
})

const getViewer = inject('getViewer')

useSwissnamesLabelsRenderer(getViewer, layerConfig)
</script>

<template>
    <slot />
</template>
