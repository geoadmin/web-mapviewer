<template>
    <div id="search-bar" class="d-flex flex-fill">
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
        />
        <button
            v-show="searchQuery && searchQuery.length > 0"
            id="clear-search-button"
            class="btn bg-transparent"
            data-cy="searchbar-clear"
            @click="clearSearchQuery"
        >
            <font-awesome-icon :icon="['fa', 'times']" />
        </button>
    </div>
</template>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import 'src/scss/variables';
#clear-search-button {
    margin-left: -40px;
    z-index: $zindex-map + 1;
}
</style>

<script>
import { mapActions, mapState } from 'vuex'

export default {
    computed: {
        ...mapState({
            searchQuery: (state) => state.search.query,
        }),
    },
    methods: {
        ...mapActions(['setSearchQuery', 'showSearchResults', 'hideSearchResults']),
        updateSearchQuery: function (e) {
            this.setSearchQuery({ query: e.target.value })
        },
        showSearchResultsIfExists: function () {
            if (this.searchQuery && this.searchQuery.length >= 2) {
                this.showSearchResults()
            }
        },
        clearSearchQuery: function () {
            this.setSearchQuery('')
            // we then give back the focus to the search input so the user can seamlessly continue to type search queries
            this.$refs.search.focus()
        },
    },
}
</script>
