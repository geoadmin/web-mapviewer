<script setup>
import { computed } from 'vue'

import AbstractLayer from '@/api/layers/AbstractLayer.class'
import LayerDescription from '@/modules/menu/components/LayerDescription.vue'
import SimpleWindow from '@/utils/components/SimpleWindow.vue'

const { layer, layerId, layerName } = defineProps({
    layer: {
        type: AbstractLayer || null,
        default: null,
    },
    layerId: {
        type: String || null,
        default: null,
    },
    layerName: {
        type: String || null,
        default: null,
    },
})
const emit = defineEmits(['close'])

const title = computed(() => layer?.name ?? layerName)
</script>

<template>
    <SimpleWindow
        :title="title"
        small
        movable
        allow-print
        resizeable
        initial-position="top-left"
        @close="emit('close', layerId)"
    >
        <LayerDescription
            :layer="layer"
            :layer-id="layerId"
        />
    </SimpleWindow>
</template>
