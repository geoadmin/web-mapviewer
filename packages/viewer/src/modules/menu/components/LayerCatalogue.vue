<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import LayerCatalogueItem from '@/modules/menu/components/LayerCatalogueItem.vue'
import useLayersStore from '@/store/modules/layers'
import type { Layer } from '@swissgeo/layers'
import type { ActionDispatcher } from '@/store/types'

const dispatcher: ActionDispatcher = { name: 'LayerCatalogue.vue' }

const {
    layerCatalogue,
    compact = false,
    withSearchBar = false,
    isTopic = false,
} = defineProps<{
    layerCatalogue: Layer[]
    compact?: boolean
    withSearchBar?: boolean
    isTopic?: boolean
}>()

const { t } = useI18n()
const layersStore = useLayersStore()

const searchText = ref<string>('')
const searchInputRef = useTemplateRef<HTMLInputElement>('searchInput')

const showSearchBar = computed<boolean>(() => withSearchBar && layerCatalogue.length > 0)

watch(
    () => layerCatalogue,
    () => {
        searchText.value = ''
    }
)

function clearPreviewLayer() {
    if (layersStore.previewLayer) {
        layersStore.clearPreviewLayer(dispatcher)
    }
}

let debounceTimeout: ReturnType<typeof setTimeout>

function onSearchInput(event: Event) {
    clearTimeout(debounceTimeout)

    const { value } = event.target as HTMLInputElement

    if (value?.length >= 2) {
        debounceTimeout = setTimeout(() => {
            searchText.value = value
        }, 100)
    } else if (!value) {
        searchText.value = ''
    }
}

function clearSearchText() {
    searchText.value = ''
    if (searchInputRef.value) {
        searchInputRef.value.focus()
    }
}
</script>

<template>
    <div @mouseleave="clearPreviewLayer">
        <div
            v-if="showSearchBar"
            class="input-group input-group-sm d-flex pb-1"
        >
            <span
                id="searchCatalogueIcon"
                class="input-group-text"
            >
                <FontAwesomeIcon :icon="['fas', 'search']" />
            </span>
            <input
                ref="searchInput"
                type="text"
                class="form-control"
                :class="{ 'rounded-end': !searchText.length }"
                :placeholder="t('search_in_catalogue_placeholder')"
                aria-label="Search"
                aria-describedby="searchCatalogueIcon searchCatalogueInputButton"
                :value="searchText"
                data-cy="search-catalogue-input"
                @input="onSearchInput"
            />
            <button
                v-show="searchText?.length > 0"
                id="searchCatalogueInputButton"
                class="btn btn-outline-group"
                type="button"
                data-cy="search-catalogue-clear"
                @click="clearSearchText"
            >
                <FontAwesomeIcon :icon="['fas', 'times-circle']" />
            </button>
        </div>
        <LayerCatalogueItem
            v-for="(item, index) in layerCatalogue"
            :key="`${index}-${item.id}`"
            :item="item"
            :search="searchText.toLowerCase()"
            :compact="compact"
            :is-topic="isTopic"
        />
    </div>
</template>
