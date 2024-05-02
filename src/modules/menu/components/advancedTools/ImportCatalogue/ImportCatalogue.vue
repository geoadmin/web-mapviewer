<script setup>
import { computed, ref, toRefs } from 'vue'
import { useStore } from 'vuex'

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

const store = useStore()

const isDesktopMode = computed(() => store.getters.isDesktopMode)

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
    <div
        class="import-catalogue ps-2"
        :class="{ 'desktop-mode': isDesktopMode, 'me-2': !isDesktopMode }"
        data-cy="import-catalog-content"
    >
        <ProviderUrl @capabilities:parsed="onNewCapabilities" @capabilities:cleared="onClear" />
        <LayerCatalogue
            class="mb-2"
            :layer-catalogue="capabilities"
            :compact="compact"
            with-search-bar
        />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@import '@/scss/variables.module';

.import-catalogue {
    &.desktop-mode {
        // Here we need to set the max-width with a buffer of 32px to avoid changing the width
        // of the input due the scrollbar that could appears when toggling the dropdown of the
        // input element of ProviderUrl
        max-width: calc($menu-tray-width - 32px);
    }
}
</style>
