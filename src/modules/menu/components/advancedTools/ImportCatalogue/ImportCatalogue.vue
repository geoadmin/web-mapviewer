<script setup>
import { ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import ProviderUrl from '@/modules/menu/components/advancedTools/ImportCatalogue/ProviderUrl.vue'
import LayerCatalogue from '@/modules/menu/components/LayerCatalogue.vue'
import log from '@/utils/logging'

const props = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})

const i18n = useI18n()

const { compact } = toRefs(props)
const wmsMaxSize = ref(null)
const capabilities = ref([])

function onNewCapabilities(newCapabilities, newWmsMaxSize) {
    log.debug(`New capabilities`, newCapabilities, newWmsMaxSize)
    capabilities.value = newCapabilities
    wmsMaxSize.value = newWmsMaxSize
}

function onClear() {
    capabilities.value = []
    wmsMaxSize.value = null
}
</script>

<template>
    <div class="ps-2" data-cy="import-catalog-content">
        <ProviderUrl @capabilities:parsed="onNewCapabilities" @capabilities:clear="onClear" />
        <div v-if="wmsMaxSize">
            {{ i18n.t('wms_max_size_allowed') }} {{ wmsMaxSize.width }} * {{ wmsMaxSize.height }}
        </div>
        <LayerCatalogue class="mb-2" :layer-catalogue="capabilities" :compact="compact" />
    </div>
</template>

<style lang="scss" scoped></style>
