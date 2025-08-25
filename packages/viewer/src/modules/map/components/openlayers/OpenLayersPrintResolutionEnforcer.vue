<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

const { resolution } = defineProps({
    resolution: {
        type: Number,
        required: true,
    },
})

const olMap = inject('olMap')

const store = useStore()
const mapResolution = computed(() => store.getters.resolution)

const startingResolution = ref(null)

onMounted(() => {
    startingResolution.value = mapResolution.value
    olMap.getView().setResolution(resolution)
})

onBeforeUnmount(() => {
    olMap.getView().setResolution(startingResolution.value)
})
</script>

<template>
    <slot />
</template>
