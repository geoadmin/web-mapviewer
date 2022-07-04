<template>
    <div class="search-bar input-group" :class="{ 'search-bar-filled': searchQuery?.length > 0 }">
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
        <ButtonWithIcon
            v-if="searchQuery?.length > 0"
            :button-font-awesome-icon="['fas', 'times-circle']"
            class="search-bar-clear"
            data-cy="searchbar-clear"
            transparent
            @click="clearSearchQuery"
        />
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import SearchResultList from '@/modules/menu/components/search/SearchResultList.vue'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'

export default {
    components: {
        SearchResultList,
        ButtonWithIcon,
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
    display: flex;
    flex: 1 1 auto;

    &-clear {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 3;
    }

    &-filled .form-control {
        padding-right: 2.5rem;
    }
}
#clear-search-button {
    margin-left: -40px;
    z-index: $zindex-map + 1;
}
</style>
