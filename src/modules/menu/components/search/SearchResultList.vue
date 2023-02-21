<template>
    <div
        id="search-results"
        :class="[
            isPhoneMode ? ['border-top', 'border-bottom', 'rounded-bottom'] : ['border', 'rounded'],
            { 'search-results-dev-site-warning': hasDevSiteWarning && isPhoneMode },
            ['bg-light'],
        ]"
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
import { mapActions, mapState, mapGetters } from 'vuex'
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
        ...mapGetters(['isPhoneMode', 'hasDevSiteWarning']),
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
@import 'src/scss/variables';

#search-results {
    position: fixed;
    top: $header-height;
    overflow: hidden;
    left: 0%;
    width: 100%;
    max-height: calc(75vh - 3rem);
    margin: 0; //overwrites a bootstrap property from parent module
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}

.search-results-dev-site-warning {
    // Must be important as it needs to overrite the top defined in #search-results
    top: $header-height + $dev-disclaimer-height !important;
    // Put the search results under the rest of the header so hovering over the warning works
    // correctly
    z-index: -1;
}
@include respond-above(phone) {
    #search-results {
        position: absolute;
        top: 100%;
    }
    .search-results-dev-site-warning {
        z-index: initial;
    }
}
@include respond-above(lg) {
    #search-results {
        max-height: calc(75vh - 6rem);
    }
}
</style>
