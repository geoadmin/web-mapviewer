<script setup>
import log from '@geoadmin/log'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { SearchResultTypes } from '@/api/search.api'
import SearchResultCategory from '@/modules/menu/components/search/SearchResultCategory.vue'
import debounce from '@/utils/debounce'

const dispatcher = { dispatcher: 'SearchResultList.vue' }

const emit = defineEmits(['close', 'firstResultEntryReached'])
const store = useStore()
const { t } = useI18n()

const resultCategories = useTemplateRef('resultCategories')

const preview = ref(null)

const results = computed(() => store.state.search.results)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const isPhoneMode = computed(() => store.getters.isPhoneMode)

const previewLayer = computed(() => store.state.layers.previewLayer)
const previewedPinnedLocation = computed(() => store.state.map.previewedPinnedLocation)

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

watch(preview, (newPreview) => setPreviewDebounced(newPreview))

function focusFirstEntry() {
    const firstCategory = categories.value.findIndex((category) => category.results.length > 0)
    if (firstCategory >= 0) {
        resultCategories.value[firstCategory]?.focusFirstEntry()
    }
}

function onFirstEntryReached(index) {
    const previousCategoryIndex = categories.value.findLastIndex(
        (category, i) => i < index && category.results.length > 0
    )
    if (previousCategoryIndex < 0) {
        emit('firstResultEntryReached')
    } else {
        // jumping up to the previous category's last result
        resultCategories.value[previousCategoryIndex]?.focusLastEntry()
    }
}

function onLastEntryReached(index) {
    const nextCategoryIndex = categories.value.findIndex(
        (category, i) => i > index && category.results.length > 0
    )
    if (nextCategoryIndex > 0) {
        resultCategories.value[nextCategoryIndex]?.focusFirstEntry()
    }
}

function setPreview(entry) {
    preview.value = entry
}

function clearPreview(entry) {
    // only clear the preview if not another entry has been set
    if (preview.value?.id === entry.id) {
        preview.value = null
    }
}

// We debounce the preview to avoid too many store dispatch
const PREVIEW_DEBOUNCING_DELAY = 50
const setPreviewDebounced = debounce((entry) => {
    log.debug(`Set preview`, entry, previewLayer.value, previewedPinnedLocation.value)
    if (!entry) {
        if (previewLayer.value) {
            store.dispatch('clearPreviewLayer', dispatcher)
        }
        if (previewedPinnedLocation.value) {
            store.dispatch('setPreviewedPinnedLocation', { coordinates: null, ...dispatcher })
        }
    } else if (entry.resultType === SearchResultTypes.LAYER) {
        store.dispatch('setPreviewLayer', {
            layer: entry.layerId,
            ...dispatcher,
        })
        if (previewedPinnedLocation.value) {
            store.dispatch('setPreviewedPinnedLocation', { coordinates: null, ...dispatcher })
        }
    } else if (entry.coordinate) {
        store.dispatch('setPreviewedPinnedLocation', {
            coordinates: entry.coordinate,
            ...dispatcher,
        })
        if (previewLayer.value) {
            store.dispatch('clearPreviewLayer', dispatcher)
        }
    }
}, PREVIEW_DEBOUNCING_DELAY)

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
                'rounded-bottom': !isPhoneMode,
            }"
            data-cy="search-results"
        >
            <div
                class="search-results-inner"
                :class="{ 'rounded-bottom': !isPhoneMode }"
            >
                <SearchResultCategory
                    v-for="(category, index) in categories"
                    v-show="category.results.length > 0"
                    :key="category.id"
                    ref="resultCategories"
                    :title="t(`${category.id}_results_header`)"
                    :results="category.results"
                    :data-cy="`search-results-${category.id}`"
                    @entry-selected="emit('close')"
                    @first-entry-reached="onFirstEntryReached(index)"
                    @last-entry-reached="onLastEntryReached(index)"
                    @set-preview="setPreview"
                    @clear-preview="clearPreview"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@import '@/scss/variables.module';

.search-results-container {
    position: fixed;
    // here we need -1 in order to have the focus highlight of the search on top of the result
    z-index: calc($zindex-menu-header - 1);
    top: $header-height;
    // 45vh (so that previews are visible), but on small screen min 20rem (ca. 3 lines per category)
    height: min(calc(100vh - $header-height), max(20rem, 45vh));
    left: 0;
    width: 100%;
    pointer-events: none;
}
.search-results-dev-site-warning {
    top: calc($header-height + $dev-disclaimer-height);
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
