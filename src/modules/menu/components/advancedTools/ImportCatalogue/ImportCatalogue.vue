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
    <div data-cy="import-catalog-content">
        <ProviderUrl @capabilities:parsed="onNewCapabilities" @capabilities:clear="onClear" />
        <!-- TODO display of the result-->
        <div v-if="wmsMaxSize">
            {{ $t('wms_max_size_allowed') }} {{ wmsMaxSize.width }} * {{ wmsMaxSize.height }}
        </div>
        <LayerCatalogue :layer-catalogue="capabilities" :compact="compact" />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
@import 'src/modules/menu/scss/menu-items';

.menu-topic-list {
    @extend .menu-list;
    overflow-y: auto;
}
.menu-topic-switch {
    border: 0;
    background: none;
    padding: 0;
    font: inherit;
    color: inherit;
    outline: inherit;
    &:hover,
    &:focus {
        text-decoration: underline;
    }
}
</style>
