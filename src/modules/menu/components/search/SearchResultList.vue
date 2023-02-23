<template>
    <div
        id="search-results-container"
        :class="{ 'search-results-dev-site-warning': hasDevSiteWarning && isPhoneMode }"
    >
        <div
            class="search-results bg-light"
            :class="
                isPhoneMode
                    ? ['border-top', 'border-bottom', 'rounded-bottom']
                    : ['border', 'rounded']
            "
            data-cy="search-results"
            @keydown.esc.prevent="$emit('close')"
        >
            <div class="search-results-inner">
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
        </div>
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

#search-results-container {
    position: fixed;
    top: $header-height;
    // 45vh (so that previews are visible), but on small screen min 20rem (ca. 3 lines per category)
    height: min(calc(100vh - $header-height), max(20rem, 45vh));
    left: 0;
    width: 100%;
    margin: 0; //overwrites a bootstrap property from parent module
    pointer-events: none;
}
.search-results-dev-site-warning {
    // Must be important as it needs to overrite the top defined in #search-results-container
    top: $header-height + $dev-disclaimer-height !important;
    height: min(calc(100vh - $header-height - $dev-disclaimer-height), max(20rem, 45vh)) !important;
    // Put the search results under the rest of the header so hovering over the warning works
    // correctly
    z-index: -1;
}

.search-results {
    display: grid;
    grid-auto-rows: 1fr;
    max-height: 100%;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    pointer-events: all;
}

.search-results-inner {
    display: grid;
    //Split evenly between all search result categories
    grid-auto-rows: auto;
    overflow: hidden;
}

@include respond-above(phone) {
    #search-results-container {
        position: absolute;
        top: 100%;
    }
    .search-results-dev-site-warning {
        z-index: initial;
    }
}
</style>
