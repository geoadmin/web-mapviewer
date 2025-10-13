<script lang="ts" setup>
import type Map from 'ol/Map'

import log from '@swissgeo/log'

import { inject, onBeforeUnmount, onMounted, ref } from 'vue'

import usePositionStore from '@/store/modules/position.store'

const { resolution } = defineProps<{
    resolution: number
}>()

const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error('OpenLayersMap is not available')
    throw new Error('OpenLayersMap is not available')
}

const positionStore = usePositionStore()

const startingResolution = ref<number>(positionStore.resolution)

onMounted(() => {
    startingResolution.value = positionStore.resolution
    olMap.getView().setResolution(resolution)
})

onBeforeUnmount(() => {
    if (startingResolution.value !== positionStore.resolution) {
        olMap.getView().setResolution(startingResolution.value)
    }
})
</script>

<template>
    <slot />
</template>
