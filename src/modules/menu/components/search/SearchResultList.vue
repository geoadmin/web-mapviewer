<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { SearchResultTypes } from '@/api/search.api'
import SearchResultCategory from '@/modules/menu/components/search/SearchResultCategory.vue'

const emit = defineEmits(['close', 'firstResultEntryReached'])
const store = useStore()
const i18n = useI18n()

const layerLegendId = ref(null)
const layerLegendName = ref(null)
const locationCategory = ref(null)
const layerCategory = ref(null)
const layerFeatureCategory = ref(null)

const results = computed(() => store.state.search.results)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const isPhoneMode = computed(() => store.getters.isPhoneMode)

const layerResults = computed(() =>
    results.value.filter((result) => result.resultType === SearchResultTypes.LAYER)
)
const locationResults = computed(() =>
    results.value.filter((result) => result.resultType === SearchResultTypes.LOCATION)
)
const layerFeatureResults = computed(() =>
    results.value.filter((result) => result.resultType === SearchResultTypes.FEATURE)
)

function showLayerLegend(layerResult) {
    layerLegendId.value = layerResult.layerId
    // NOTE: the service search wsgi is setting the title in <b></b> tags
    layerLegendName.value = layerResult.title.replace(/<[^>]*>?/gm, '')
}

function gotToLocationCategory() {
    locationCategory.value.focusLastEntry()
}

function gotToLayerCategory() {
    layerCategory.value.focusFirstEntry()
}

function gotToLayerFeaturesCategory() {
    layerFeatureCategory.value.focusFirstEntry()
}

function focusFirstEntry() {
    if (locationResults.value.length) {
        gotToLocationCategory()
    } else if (layerResults.value.length) {
        gotToLayerCategory()
    } else if (layerFeatureResults.value.length) {
        gotToLayerFeaturesCategory()
    }
}

defineExpose({ focusFirstEntry })
</script>

<template>
    <div
        class="search-results-container m-0"
        :class="{ 'search-results-dev-site-warning': hasDevSiteWarning && isPhoneMode }"
    >
        <div
            class="shadow-lg search-results bg-light"
            :class="{
                'border-top border-bottom': isPhoneMode,
                'border rounded-bottom': !isPhoneMode,
            }"
            data-cy="search-results"
            @keydown.esc.prevent="emit('close')"
        >
            <div class="search-results-inner">
                <SearchResultCategory
                    v-show="locationResults.length > 0"
                    ref="locationCategory"
                    :title="i18n.t('locations_results_header')"
                    :results="locationResults"
                    data-cy="search-results-locations"
                    @first-entry-reached="emit('firstResultEntryReached')"
                    @last-entry-reached="gotToLayerCategory()"
                />
                <SearchResultCategory
                    v-show="layerResults.length > 0"
                    ref="layerCategory"
                    :title="i18n.t('layers_results_header')"
                    :results="layerResults"
                    data-cy="search-results-layers"
                    @first-entry-reached="gotToLocationCategory()"
                />
                <SearchResultCategory
                    v-show="layerFeatureResults.length > 0"
                    ref="layerFeatureResults"
                    :title="i18n.t('featuresearch_results_header')"
                    :results="layerFeatureResults"
                    data-cy="search-results-layer-features"
                    @first-entry-reached="gotToLayerFeaturesCategory()"
                />
            </div>
        </div>
    </div>
</template>

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
