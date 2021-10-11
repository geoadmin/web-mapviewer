<template>
    <div
        v-show="showResults"
        id="search-results"
        class="bg-light rounded-bottom"
        data-cy="search-results"
    >
        <SearchResultCategory
            :title="$t('locations_results_header')"
            :half-size="results.layerResults.length > 0"
            :entries="results.locationResults"
        />
        <SearchResultCategory
            :title="$t('layers_results_header')"
            :half-size="results.locationResults.length > 0"
            :entries="results.layerResults"
        />
    </div>
</template>

<script>
import { mapState } from 'vuex'
import SearchResultCategory from './SearchResultCategory'

/** Component showing all results from the search, divided in two groups (categories) : layers and locations */
export default {
    components: { SearchResultCategory },
    computed: {
        ...mapState({
            results: (state) => state.search.results,
            showResults: (state) => state.search.show,
        }),
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';

#search-results {
    position: absolute;
    top: 3rem;
    left: 5%;
    width: 90%;
    max-height: calc(75vh - 3rem);
}
@include respond-above(sm) {
    #search-results {
        top: 6rem;
        max-height: calc(75vh - 6rem);
    }
}
</style>
