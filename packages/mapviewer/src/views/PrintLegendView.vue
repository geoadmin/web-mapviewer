<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import LayerDescription from '@/modules/menu/components/LayerDescription.vue'
import usePrintViewCommons from '@/views/usePrintViewCommons.composable'

const { printLayout, printContainerStyle } = usePrintViewCommons()

const store = useStore()
const visibleLayers = computed(() => store.getters.visibleLayers)
</script>

<template>
    <div
        class="print-legend-view w-100"
        :class="printLayout"
        :style="printContainerStyle"
    >
        <LayerDescription
            v-for="layer in visibleLayers"
            :key="layer.id"
            :layer="layer"
            :layer-id="layer.id"
            transform-url-into-qrcode
        />
    </div>
</template>

<style lang="scss" scoped>
.print-legend-view {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(3, 1fr);
}

@media print {
    .print-legend-view {
        break-inside: avoid;
        & > * {
            page-break-inside: avoid;
        }
    }
}
</style>
