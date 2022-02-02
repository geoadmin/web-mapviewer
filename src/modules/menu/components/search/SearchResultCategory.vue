<template>
    <div
        v-show="entries.length > 0"
        class="search-category"
        :class="{ 'search-category-half-size': halfSize }"
    >
        <div class="search-category-header p-2 bg-light h5 mb-0 fw-bold">
            {{ title }}
        </div>
        <div class="search-category-body bg-white">
            <SearchResultListEntry
                v-for="(entry, index) in entries"
                :key="`${index}-${entry.getId()}`"
                :entry="entry"
                @showLayerLegendPopup="showLayerLegendPopup"
            />
        </div>

        <LayerLegendPopup
            v-if="showLayerLegendForId"
            :layer-id="showLayerLegendForId"
            @close="closeLayerLegendPopup"
        />
    </div>
</template>

<script>
import SearchResultListEntry from './SearchResultListEntry.vue'
import LayerLegendPopup from '@/modules/menu/components/LayerLegendPopup.vue'

/**
 * Search results from the backend are sorted in two categories : layers and locations, this
 * component is there to show one of those category at a time
 */
export default {
    components: { SearchResultListEntry, LayerLegendPopup },
    props: {
        entries: {
            type: Array,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        halfSize: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            showLayerLegendForId: null,
        }
    },
    methods: {
        showLayerLegendPopup(id) {
            this.showLayerLegendForId = id
        },
        closeLayerLegendPopup() {
            this.showLayerLegendForId = null
        },
    },
}
</script>

<style lang="scss" scoped>
.search-category {
    .search-category-body {
        max-height: 15rem;
        overflow-y: scroll;
        font-size: 0.8rem;
    }
    &.search-category-half-size .search-category-body {
        max-height: 7rem;
    }
}
</style>
