<template>
    <div
        v-show="entries.length > 0"
        class="search-category"
        :class="{ 'search-category-half-size': halfSize }"
    >
        <div class="search-category-header p-2">
            {{ title }}
        </div>
        <ul class="search-category-body bg-white">
            <SearchResultListEntry
                v-for="(entry, index) in entries"
                :key="index"
                :index="index"
                :entry="entry"
                @show-layer-legend-popup="showLayerLegendPopup"
                @preview-start="bubbleEvent('previewStart', $event)"
                @preview-stop="bubbleEvent('previewStop', $event)"
            />
        </ul>

        <LayerLegendPopup
            v-if="showLayerLegendForId"
            :layer-id="showLayerLegendForId"
            @close="closeLayerLegendPopup"
        />
    </div>
</template>

<script>
import LayerLegendPopup from '@/modules/menu/components/LayerLegendPopup.vue'
import SearchResultListEntry from './SearchResultListEntry.vue'

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
    emits: ['preview'],
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
        bubbleEvent(type, payload) {
            this.$emit(type, payload)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.search-category {
    &-header {
        font-size: 0.825rem;
        font-weight: bold;
        background-color: $input-group-addon-bg;
    }
    &-body {
        margin: 0;
        padding: 0;
        list-style: none;

        max-height: 15rem;
        overflow-y: scroll;
        font-size: 0.8rem;

        .search-category-half-size & {
            max-height: 7rem;
        }
    }
}
</style>
