<template>
    <div class="search-bar input-group d-flex rounded">
        <span class="input-group-text">
            <FontAwesomeIcon :icon="['fas', 'search']" />
        </span>
        <input
            ref="search"
            type="text"
            class="form-control search-bar-input"
            :class="{ 'rounded-end': searchQuery?.length == 0 }"
            :placeholder="$t('search_placeholder')"
            aria-label="Search"
            aria-describedby="button-addon1"
            :value="searchQuery"
            data-cy="searchbar"
            @input="updateSearchQuery"
            @focus="showSearchResultsIfExists"
            @keydown.down.prevent="goToFirstResult"
            @keydown.esc.prevent="closeSearchResults"
        />
        <button
            v-if="searchQuery?.length > 0"
            id="button-addon1"
            class="btn btn-outline-group rounded-end"
            type="button"
            data-cy="searchbar-clear"
            @click="clearSearchQuery"
        >
            <FontAwesomeIcon :icon="['fas', 'times-circle']" />
        </button>
        <SearchResultList v-show="resultsShown" ref="results" @close="closeSearchResults" />
    </div>
</template>

<script>
import SearchResultList from '@/modules/menu/components/search/SearchResultList.vue'
import { mapActions, mapState } from 'vuex'

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
    mounted() {
        this.$refs.search.focus()
    },
    methods: {
        ...mapActions(['setSearchQuery', 'showSearchResults', 'hideSearchResults']),
        updateSearchQuery(event) {
            if (this.debounceSearch) {
                clearTimeout(this.debounceSearch)
            }
            this.debounceSearch = setTimeout(() => {
                this.setSearchQuery({ query: event.target.value })
            }, 50)
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
@import 'src/scss/media-query.mixin';

.search-bar-input {
    font-size: 0.825rem;;
}

.search-bar {
    &:focus-within > span.input-group-text {
        display:none
    }
    @include respond-above(phone) {
        &:focus-within > span.input-group-text{
            display: flex;
        }
    }
}

</style>
