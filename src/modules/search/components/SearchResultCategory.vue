<template>
    <div
        v-show="entries.length > 0"
        class="search-category"
        :class="{ 'search-category-half-size': halfSize }"
    >
        <div class="search-category-header">
            {{ title }}
        </div>
        <div class="search-category-body">
            <SearchResultListEntry
                v-for="(entry, index) in entries"
                :key="`${index}-${entry.getId()}`"
                :entry="entry"
            />
        </div>
    </div>
</template>

<style lang="scss">
@import 'src/scss/bootstrap-theme';
.search-category {
    .search-category-header {
        @extend .p-2;
        @extend .bg-light;
        @extend .h5;
        @extend .mb-0;
        @extend .fw-bold;
    }
    .search-category-body {
        @extend .bg-white;
        max-height: 15rem;
        overflow-y: scroll;
        font-size: 0.8rem;
    }
    &.search-category-half-size .search-category-body {
        max-height: 7rem;
    }
}
</style>

<script>
import SearchResultListEntry from './SearchResultListEntry'

/**
 * Search results from the backend are sorted in two categories : layers and locations, this
 * component is there to show one of those category at a time
 */
export default {
    components: { SearchResultListEntry },
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
}
</script>
