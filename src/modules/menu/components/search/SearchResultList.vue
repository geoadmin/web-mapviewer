<template>
    <div
        v-show="showResults"
        id="search-results"
        class="bg-light rounded-bottom"
        data-cy="search-results"
        @keydown.esc.prevent="$emit('close')"
    >
        <SearchResultCategory
            :title="$t('locations_results_header')"
            :half-size="results.locationResults.length > 0"
            :entries="results.locationResults"
            data-cy="search-results-locations"
            @preview-start="setPinnedLocation"
            @preview-stop="clearPinnedLocation"
        />
        <SearchResultCategory
            :title="$t('layers_results_header')"
            :half-size="results.layerResults.length > 0"
            :entries="results.layerResults"
            data-cy="search-results-layers"
            @preview-start="setPreviewLayer"
            @preview-stop="clearPreviewLayer"
        />
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import SearchResultCategory from './SearchResultCategory.vue'

/**
 * Component showing all results from the search, divided in two groups (categories) : layers and
 * locations
 */
export default {
    components: { SearchResultCategory },
    emits: ['close'],
    computed: {
        ...mapState({
            results: (state) => state.search.results,
            showResults: (state) => state.search.show,
        }),
    },
    methods: {
        ...mapActions([
            'setPinnedLocation',
            'clearPinnedLocation',
            'setPreviewLayer',
            'clearPreviewLayer',
        ]),
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';

#search-results {
    position: absolute;
    top: 100%;
    left: 0%;
    width: 100%;
    max-height: calc(75vh - 3rem);
}
@include respond-above(lg) {
    #search-results {
        max-height: calc(75vh - 6rem);
    }
}
</style>
