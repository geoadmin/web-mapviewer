<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import SearchResultList from '@/modules/menu/components/search/SearchResultList.vue'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'SearchBar' }

const store = useStore()

const isPristine = ref(true)
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
    // because the list has been hidden by onEntrySelected. Also if the search bar is pristine (not
    // yet modified by the user) we don't want to show the result (e.g. at startup with a swisssearch
    // query param)
    if (!selectedEntry.value && !isPristine.value) {
        log.debug(`Search has result changed to ${newValue}, change the show result to ${newValue}`)
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
    searchInput.value.focus()
})

let debounceSearch = null
const updateSearchQuery = (event) => {
    isPristine.value = false
    selectedEntry.value = null
    searchValue.value = event.target.value

    if (hasResults.value) {
        // we already have a result make sure to display it as soon as the user is typing
        showResults.value = true
    }

    clearTimeout(debounceSearch)
    debounceSearch = setTimeout(() => {
        store.dispatch('setSearchQuery', { query: event.target.value, ...dispatcher })
    }, 100)
}

const clearSearchQuery = () => {
    hasResults.value = false
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

const onInputClicked = () => {
    if (hasResults.value) {
        if (isPhoneMode.value) {
            showResults.value = !showResults.value
        } else {
            showResults.value = true
        }
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
            @click="onInputClicked"
            @input="updateSearchQuery"
            @keydown.down.prevent="goToFirstResult"
            @keydown.esc.prevent="clearSearchQuery"
            @keyup.enter.stop.prevent="goToFirstResult"
        />
        <button
            v-if="hasResults && !isPhoneMode"
            class="btn btn-outline-group"
            type="button"
            tabindex="0"
            data-cy="searchbar-toggle-result"
            @click="toggleResults"
        >
            <FontAwesomeIcon :icon="showResults ? 'caret-up' : 'caret-down'" />
        </button>
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
