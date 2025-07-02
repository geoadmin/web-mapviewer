<script lang="ts" setup>
import type Map from 'ol/Map'

import { inject, onBeforeUnmount, onMounted, ref } from 'vue'

import usePositionStore from '@/store/modules/position.store'

const { resolution } = defineProps<{
    resolution: number
}>()

const olMap: Map = inject('olMap') as Map

const positionStore = usePositionStore()

const startingResolution = ref<number>(positionStore.resolution)

onMounted(() => {
    startingResolution.value = positionStore.resolution
    olMap.getView().setResolution(resolution)
})

onBeforeUnmount(() => {
    olMap.getView().setResolution(startingResolution.value)
})
</script>

<template>
    <slot />
</template>
