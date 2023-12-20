<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import SearchResultList from '@/modules/menu/components/search/SearchResultList.vue'

const store = useStore()

const showResults = ref(false)
const debounceSearch = ref(null)
const searchInput = ref(null)
const searchValue = ref('')
const results = ref(null)

const searchQuery = computed(() => store.state.search.query)
const hasResults = computed(() => store.state.search.results.count())
const isPhoneMode = computed(() => store.getters.isPhoneMode)

watch(hasResults, (newValue) => {
    showResults.value = newValue
})

watch(showResults, (newValue) => {
    if (newValue && isPhoneMode.value && store.state.ui.showMenu) {
        store.dispatch('toggleMenu')
    }
})

onMounted(() => {
    // NOTE: we only set the input to the search query parameter during the initial load of the
    // view, but not after, this means if a user manually change the query parameter it will not be
    // updated in the input field. This is to avoid the result query to update the input which
    // can delete input character entered by the user.
    searchValue.value = searchQuery.value
    searchInput.value.focus()
})

const updateSearchQuery = (event) => {
    searchValue.value = event.target.value
    if (debounceSearch.value) {
        clearTimeout(debounceSearch.value)
    }
    debounceSearch.value = setTimeout(() => {
        store.dispatch('setSearchQuery', { query: event.target.value })
    }, 200)
}

const onSearchInputFocus = () => {
    if (hasResults.value) {
        showResults.value = true
    }
}

const clearSearchQuery = () => {
    searchValue.value = ''
    store.dispatch('setSearchQuery', { query: '' })
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
            results.value.$el.querySelector('[tabindex="0"]').focus()
        })
    }
}

const onClickOutside = (event) => {
    if (!document.body.querySelector('.modal-popup')?.contains(event.target)) {
        showResults.value = false
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
            @input="updateSearchQuery"
            @focus="onSearchInputFocus"
            @keydown.down.prevent="goToFirstResult"
            @keydown.esc.prevent="closeSearchResults"
        />
        <button
            v-show="searchValue"
            id="clearSearchButton"
            class="btn btn-outline-group rounded-end"
            :class="{ 'rounded-bottom-0': showResults && !isPhoneMode }"
            type="button"
            data-cy="searchbar-clear"
            @click="clearSearchQuery"
        >
            <FontAwesomeIcon :icon="['fas', 'times-circle']" />
        </button>
        <SearchResultList v-show="showResults" ref="results" @close="closeSearchResults" />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
</style>
