<script setup>
import log from '@geoadmin/log'
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { sendMapReadyEventToParent } from '@/api/iframePostMessageEvent.api'
import LayerDescription from '@/modules/menu/components/LayerDescription.vue'
import usePrintViewCommons from '@/views/usePrintViewCommons.composable'

const { printLayout, printContainerStyle } = usePrintViewCommons()

const loadedLayerDescriptions = ref(0)

const store = useStore()
const visibleLayers = computed(() => store.getters.visibleLayers)
const visibleLayersCount = computed(() => visibleLayers.value.length)

watch(visibleLayersCount, () => {
    loadedLayerDescriptions.value = 0
})
watch(loadedLayerDescriptions, () => {
    if (loadedLayerDescriptions.value === visibleLayersCount.value) {
        log.debug('All layer descriptions loaded. Sending map ready event to parent window.')
        sendMapReadyEventToParent()
    }
})
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
            @loaded="loadedLayerDescriptions++"
        />
    </div>
</template>

<style lang="scss" scoped>
.print-legend-view {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(2, 1fr);
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
