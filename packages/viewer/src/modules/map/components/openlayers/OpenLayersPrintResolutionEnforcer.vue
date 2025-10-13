<script setup lang="ts">
import type { Map } from 'ol'

import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'

import usePositionStore from '@/store/modules/position.store'

interface Props {
    resolution: number
}

const props = defineProps<Props>()

const olMap = inject<Map>('olMap')!

const positionStore = usePositionStore()
const mapResolution = computed(() => positionStore.resolution)

const startingResolution = ref<number | undefined>(undefined)

onMounted(() => {
    startingResolution.value = mapResolution.value
    olMap.getView().setResolution(props.resolution)
})

onBeforeUnmount(() => {
    if (startingResolution.value !== undefined) {
        olMap.getView().setResolution(startingResolution.value)
    }
})
</script>

<template>
    <slot />
</template>
