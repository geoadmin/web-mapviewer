<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import LayerCatalogueItem from '@/modules/menu/components/LayerCatalogueItem.vue'

const dispatcher = { dispatcher: 'LayerCatalogue.vue' }

const { layerCatalogue, compact, withSearchBar, isTopic } = defineProps({
    layerCatalogue: {
        type: Array,
        required: true,
    },
    compact: {
        type: Boolean,
        default: false,
    },
    withSearchBar: {
        type: Boolean,
        default: false,
    },
    isTopic: {
        type: Boolean,
        default: false,
    },
})

const store = useStore()
const { t } = useI18n()

const searchText = ref('')
const searchInput = useTemplateRef('searchInput')

const showSearchBar = computed(() => withSearchBar && layerCatalogue.length > 0)

watch(
    () => layerCatalogue,
    () => {
        searchText.value = ''
    }
)

function clearPreviewLayer() {
    if (store.state.layers.previewLayer) {
        store.dispatch('clearPreviewLayer', dispatcher)
    }
}

let debounceTimeout = null
function onSearchInput(event) {
    clearTimeout(debounceTimeout)
    if (event.target.value?.length >= 2) {
        debounceTimeout = setTimeout(() => {
            searchText.value = event.target.value
        }, 100)
    } else if (!event.target.value) {
        searchText.value = ''
    }
}

function clearSearchText() {
    searchText.value = ''
    searchInput.value.focus()
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
