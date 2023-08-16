<template>
    <div
        class="search-results-container m-0"
        :class="{ 'search-results-dev-site-warning': hasDevSiteWarning && isPhoneMode }"
    >
        <div
            class="search-results bg-light"
            :class="{
                'border-top border-bottom rounded-bottom': isPhoneMode,
                'border rounded': !isPhoneMode,
            }"
            data-cy="search-results"
            @keydown.esc.prevent="$emit('close')"
        >
            <div class="search-results-inner">
                <SearchResultCategory
                    :title="$t('locations_results_header')"
                    :entries="results.locationResults"
                    data-cy="search-results-locations"
                >
                    <SearchResultListEntry
                        v-for="(location, index) in results.locationResults"
                        :key="index"
                        :index="index"
                        :entry="location"
                    />
                </SearchResultCategory>
                <SearchResultCategory
                    :title="$t('layers_results_header')"
                    :entries="results.layerResults"
                    data-cy="search-results-layers"
                >
                    <SearchResultListEntry
                        v-for="(layer, index) in results.layerResults"
                        :key="index"
                        :index="index"
                        :entry="layer"
                        @show-layer-legend-popup="showLayerLegendForId = layer.layerId"
                    />
                </SearchResultCategory>
            </div>
        </div>
        <LayerLegendPopup
            v-if="showLayerLegendForId"
            :layer-id="showLayerLegendForId"
            @close="showLayerLegendForId = null"
        />
    </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import SearchResultCategory from './SearchResultCategory.vue'
import SearchResultListEntry from '@/modules/menu/components/search/SearchResultListEntry.vue'
import LayerLegendPopup from '@/modules/menu/components/LayerLegendPopup.vue'

/**
 * Component showing all results from the search, divided in two groups (categories) : layers and
 * locations
 */
export default {
    components: { LayerLegendPopup, SearchResultListEntry, SearchResultCategory },
    emits: ['close'],
    data() {
        return {
            showLayerLegendForId: null,
        }
    },
    computed: {
        ...mapState({
            results: (state) => state.search.results,
        }),
        ...mapGetters(['isPhoneMode', 'hasDevSiteWarning']),
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/variables';

.search-results-container {
    position: fixed;
    z-index: $zindex-menu-header;
    top: $header-height;
    // 45vh (so that previews are visible), but on small screen min 20rem (ca. 3 lines per category)
    height: min(calc(100vh - $header-height), max(20rem, 45vh));
    left: 0;
    width: 100%;
    pointer-events: none;
}
.search-results-dev-site-warning {
    top: $header-height + $dev-disclaimer-height;
    height: min(calc(100vh - $header-height - $dev-disclaimer-height), max(20rem, 45vh));
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
    .search-results-container {
        position: absolute;
        top: 100%;
    }
    .search-results-dev-site-warning {
        z-index: initial;
    }
}
</style>
