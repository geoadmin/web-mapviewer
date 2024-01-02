<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

import LayerCatalogueItem from '@/modules/menu/components/LayerCatalogueItem.vue'

const { layerCatalogue, compact } = defineProps({
    layerCatalogue: {
        type: Array,
        required: true,
    },
    compact: {
        type: Boolean,
        default: false,
    },
})

const store = useStore()

const searchText = ref('')

function clearPreviewLayer() {
    if (store.state.layers.previewLayer) {
        store.dispatch('clearPreviewLayer')
    }
}

let debounceTimeout = null
function onSearchInput(event) {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
        searchText.value = event.target.value
    }, 50)
}

function clearSearchText() {
    searchText.value = ''
}
</script>

<template>
    <div @mouseleave="clearPreviewLayer">
        <div class="input-group input-group-sm d-flex p-1">
            <span id="searchCatalogueIcon" class="input-group-text">
                <FontAwesomeIcon :icon="['fas', 'search']" />
            </span>
            <input
                type="text"
                class="form-control"
                :class="{ 'rounded-end': !searchText.length }"
                :placeholder="$t('search_in_catalogue_placeholder')"
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
