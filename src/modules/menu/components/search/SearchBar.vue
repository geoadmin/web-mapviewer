<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import SearchResultList from '@/modules/menu/components/search/SearchResultList.vue'

const dispatcher = { dispatcher: 'SearchBar' }

const store = useStore()

const showResults = ref(false)
const searchInput = ref(null)
const searchValue = ref('')
const results = ref(null)
const selectedEntry = ref(null)

const searchQuery = computed(() => store.state.search.query)
const hasResults = computed(() => store.state.search.results.length > 0)
const isPhoneMode = computed(() => store.getters.isPhoneMode)

watch(hasResults, (newValue) => {
    // if an entry has been selected from the list, do not show the list again
    // because the list has been hidden by onEntrySelected
    if (!selectedEntry.value) {
        showResults.value = newValue
    }
})

watch(showResults, (newValue) => {
    if (newValue && isPhoneMode.value && store.state.ui.showMenu) {
        store.dispatch('toggleMenu', dispatcher)
    }
})

watch(searchQuery, (newQuery) => {
    searchValue.value = newQuery
})

onMounted(() => {
    searchValue.value = searchQuery.value
})

let debounceSearch = null
const updateSearchQuery = (event) => {
    selectedEntry.value = null
    searchValue.value = event.target.value

    clearTimeout(debounceSearch)
    debounceSearch = setTimeout(() => {
        store.dispatch('setSearchQuery', { query: event.target.value, ...dispatcher })
    }, 100)
}

const onSearchInputFocus = (event) => {
    // When the focus event is due to a programatic focus event, the relatedTarget is not null
    // and in this case we don't want to show the result. For example when selecting a result value
    // we want to close the result and focus on the input, so that the user can directly change
    // the search.
    if (!event.relatedTarget && hasResults.value) {
        showResults.value = true
    }
}

const clearSearchQuery = () => {
    showResults.value = false
    selectedEntry.value = null
    searchValue.value = ''
    store.dispatch('setSearchQuery', { query: '', ...dispatcher })
    searchInput.value.focus()
}

const closeSearchResults = () => {
    showResults.value = false
    searchInput.value.focus()
}

const goToFirstResult = () => {
    if (hasResults.value) {
        if (!showResults.value) {
            showResults.value = true
        }
        // here we need to do the focus on nex tick if the result list was
        // not displayed, otherwise the focus won't work (e.g result list
        // is hidden and the user press the key down, it would then only show
        // the list but not focus, to focus the user would need to press the key
        // down again)
        nextTick(() => {
            results.value.focusFirstEntry()
        })
    }
}

const onEntrySelected = (entry) => {
    selectedEntry.value = entry
    showResults.value = false
}

const onClickOutside = (event) => {
    if (!document.body.querySelector('.modal-popup')?.contains(event.target)) {
        showResults.value = false
    }
}

const focusSearchInput = () => {
    searchInput.value.focus()
}

const toggleResults = () => {
    if (hasResults.value) {
        showResults.value = !showResults.value
    }
}
</script>

<template>
    <div v-click-outside="onClickOutside" class="input-group">
        <span
            v-show="!isPhoneMode"
            id="searchIconText"
            class="input-group-text"
            :class="{ 'rounded-bottom-0': showResults }"
        >
            <FontAwesomeIcon :icon="['fas', 'search']" />
        </span>
        <input
            ref="searchInput"
            type="text"
            class="form-control text-truncate"
            :class="{
                'rounded-bottom-0': showResults,
                'rounded-start': isPhoneMode,
                'rounded-end': !searchValue,
            }"
            :placeholder="$t('search_placeholder')"
            aria-label="Search"
            aria-describedby="searchIconText clearSearchButton"
            :value="searchValue"
            data-cy="searchbar"
            tabindex="0"
            @input="updateSearchQuery"
            @focus="onSearchInputFocus"
            @keydown.down.prevent="goToFirstResult"
            @keydown.esc.prevent="toggleResults"
            @keyup.enter.stop.prevent="goToFirstResult"
        />
        <button
            v-show="searchValue"
            id="clearSearchButton"
            class="btn btn-outline-group rounded-end"
            :class="{ 'rounded-bottom-0': showResults && !isPhoneMode }"
            type="button"
            tabindex="0"
            data-cy="searchbar-clear"
            @click="clearSearchQuery"
        >
            <FontAwesomeIcon :icon="['fas', 'times-circle']" />
        </button>
        <SearchResultList
            v-show="showResults"
            ref="results"
            @close="closeSearchResults"
            @entry-selected="onEntrySelected"
            @first-result-entry-reached="focusSearchInput()"
        />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
</style>
