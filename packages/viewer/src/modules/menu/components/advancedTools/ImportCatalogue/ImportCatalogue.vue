<script setup lang="ts">
import log from '@swissgeo/log'
import { computed, ref } from 'vue'

import ProviderUrl from '@/modules/menu/components/advancedTools/ImportCatalogue/ProviderUrl.vue'
import LayerCatalogue from '@/modules/menu/components/LayerCatalogue.vue'
import useUIStore from '@/store/modules/ui.store'
import type { GeoAdminGroupOfLayers, GeoAdminLayer } from '@swissgeo/layers'

const { compact } = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})

const capabilities = ref<(GeoAdminLayer | GeoAdminGroupOfLayers)[]>([])

const uiStore = useUIStore()

const isDesktopMode = computed(() => uiStore.isDesktopMode)

function onNewCapabilities(newCapabilities: (GeoAdminLayer | GeoAdminGroupOfLayers)[]) {
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
        <ProviderUrl
            @capabilities:parsed="onNewCapabilities"
            @capabilities:cleared="onClear"
        />
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
