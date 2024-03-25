<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { SearchResultTypes } from '@/api/search.api'
import SearchResultCategory from '@/modules/menu/components/search/SearchResultCategory.vue'

const emit = defineEmits(['close', 'firstResultEntryReached'])
const store = useStore()
const i18n = useI18n()

const resultCategories = ref([])

const results = computed(() => store.state.search.results)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const isPhoneMode = computed(() => store.getters.isPhoneMode)

const locationResults = computed(() =>
    results.value.filter((result) => result.resultType === SearchResultTypes.LOCATION)
)
const layerResults = computed(() =>
    results.value.filter((result) => result.resultType === SearchResultTypes.LAYER)
)
const layerFeatureResults = computed(() =>
    results.value.filter((result) => result.resultType === SearchResultTypes.FEATURE)
)

const categories = computed(() => {
    return [
        {
            id: 'locations',
            results: locationResults.value,
        },
        {
            id: 'layers',
            results: layerResults.value,
        },
        {
            id: 'featuresearch',
            results: layerFeatureResults.value,
        },
    ]
})

function focusFirstEntry() {
    const firstCategoryWithResults = categories.value.find(
        (category) => category.results.length > 0
    )
    resultCategories.value[categories.value.indexOf(firstCategoryWithResults)]?.focusFirstEntry()
}

function onFirstEntryReached(index) {
    if (index === 0) {
        emit('firstResultEntryReached')
    } else if (index > 0) {
        // jumping up to the previous category's last result
        resultCategories.value[index - 1]?.focusLastEntry()
    }
}

function onLastEntryReached(index) {
    if (index < resultCategories.value.length - 1) {
        resultCategories.value[index + 1]?.focusFirstEntry()
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
                    v-for="(category, index) in categories"
                    v-show="category.results.length > 0"
                    :key="category.id"
                    ref="resultCategories"
                    :title="i18n.t(`${category.id}_results_header`)"
                    :results="category.results"
                    :data-cy="`search-results-${category.id}`"
                    @first-entry-reached="onFirstEntryReached(index)"
                    @last-entry-reached="onLastEntryReached(index)"
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
