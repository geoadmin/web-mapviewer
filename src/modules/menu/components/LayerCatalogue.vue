<script setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import LayerCatalogueItem from '@/modules/menu/components/LayerCatalogueItem.vue'

const props = defineProps({
    layerCatalogue: {
        type: Array,
        required: true,
    },
    compact: {
        type: Boolean,
        default: false,
    },
    hasSearchBar: {
        type: Boolean,
        default: false,
    },
})
const { layerCatalogue, compact, hasSearchBar } = toRefs(props)

const store = useStore()
const i18n = useI18n()

const searchText = ref('')
const searchInput = ref(null)

const showSearchBar = computed(() => hasSearchBar.value && layerCatalogue.value.length > 0)

function clearPreviewLayer() {
    if (store.state.layers.previewLayer) {
        store.dispatch('clearPreviewLayer')
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
        <div v-if="showSearchBar" class="input-group input-group-sm d-flex p-1">
            <span id="searchCatalogueIcon" class="input-group-text">
                <FontAwesomeIcon :icon="['fas', 'search']" />
            </span>
            <input
                ref="searchInput"
                type="text"
                class="form-control"
                :class="{ 'rounded-end': !searchText.length }"
                :placeholder="i18n.t('search_in_catalogue_placeholder')"
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
            v-for="item in layerCatalogue"
            :key="item.getID()"
            :item="item"
            :search="searchText.toLowerCase()"
            :compact="compact"
        />
    </div>
</template>
