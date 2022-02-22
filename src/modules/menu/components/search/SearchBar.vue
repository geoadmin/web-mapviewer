<template>
    <div class="search-bar input-group">
        <span class="input-group-text">
            <FontAwesomeIcon :icon="['fas', 'search']" />
        </span>
        <input
            ref="search"
            type="text"
            class="form-control"
            :placeholder="$t('search_placeholder')"
            aria-label="Search"
            aria-describedby="search-icon"
            :value="searchQuery"
            data-cy="searchbar"
            @input="updateSearchQuery"
            @focus="showSearchResultsIfExists"
            @keydown.down.prevent="goToFirstResult"
            @keydown.esc.prevent="closeSearchResults"
        />
        <SearchResultList ref="results" @close="closeSearchResults" />
        <button
            v-show="searchQuery?.length > 0"
            class="btn bg-transparent"
            data-cy="searchbar-clear"
            @click="clearSearchQuery"
        >
            <FontAwesomeIcon :icon="['fa', 'times']" />
        </button>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import SearchResultList from '@/modules/menu/components/search/SearchResultList.vue'

export default {
    components: {
        SearchResultList,
    },
    computed: {
        ...mapState({
            searchQuery: (state) => state.search.query,
            hasResults: (state) => state.search.results.count() > 0,
            resultsShown: (state) => state.search.show,
        }),
    },
    methods: {
        ...mapActions(['setSearchQuery', 'showSearchResults', 'hideSearchResults']),
        updateSearchQuery(event) {
            this.setSearchQuery({ query: event.target.value })
        },
        showSearchResultsIfExists() {
            if (this.searchQuery && this.searchQuery.length >= 2) {
                this.showSearchResults()
            }
        },
        clearSearchQuery() {
            this.setSearchQuery('')
            // we then give back the focus to the search input so the user can seamlessly continue to type search queries
            this.$refs.search.focus()
        },
        closeSearchResults() {
            // Set the focus first as it would reopen the results.
            this.$refs.search.focus()
            this.hideSearchResults()
        },
        goToFirstResult() {
            if (!this.resultsShown) {
                this.showSearchResults()
            }
            if (this.hasResults) {
                // Wait a tick in case the results weren't shown before.
                this.$nextTick(() => {
                    // Switch focus to the first search result that can get it.
                    // Initially, this will be the first entry of the location list.
                    this.$refs.results.$el.querySelector('[tabindex="0"]').focus()
                })
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.search-bar {
    position: static;
    display: flex;
    flex: 1 1 auto;
}
#clear-search-button {
    margin-left: -40px;
    z-index: $zindex-map + 1;
}
</style>
