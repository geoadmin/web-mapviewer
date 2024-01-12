<script setup>
import { ref, toRefs } from 'vue'

import ProviderUrl from '@/modules/menu/components/advancedTools/ImportCatalogue/ProviderUrl.vue'
import LayerCatalogue from '@/modules/menu/components/LayerCatalogue.vue'
import log from '@/utils/logging'

const props = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})

const { compact } = toRefs(props)
const capabilities = ref([])

function onNewCapabilities(newCapabilities) {
    log.debug(`New capabilities`, newCapabilities)
    capabilities.value = newCapabilities.sort((layerA, layerB) =>
        layerA.name.localeCompare(layerB.name, undefined, { sensitivity: 'base' })
    )
}

function onClear() {
    capabilities.value = []
}
</script>

<template>
    <div class="ps-2" data-cy="import-catalog-content">
        <ProviderUrl @capabilities:parsed="onNewCapabilities" @capabilities:cleared="onClear" />
        <LayerCatalogue
            class="mb-2"
            :layer-catalogue="capabilities"
            :compact="compact"
            with-search-bar
        />
    </div>
</template>

<style lang="scss" scoped></style>
