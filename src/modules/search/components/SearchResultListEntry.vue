<template>
    <div
        class="search-category-entry p-2 ps-4 border-bottom border-light"
        data-cy="search-result-entry"
        @click="onClick"
        @mouseover="onMouseOver"
        @mouseleave="onMouseLeave"
    >
        <!-- eslint-disable-next-line vue/no-v-html-->
        <span v-html="entry.title"></span>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
import { SearchResult } from '@/api/search.api'

/** Component showing one search result entry (and dispatching its selection to the store) */
export default {
    props: {
        entry: {
            type: SearchResult,
            required: true,
        },
    },
    methods: {
        ...mapActions(['selectResultEntry']),
        onClick: function () {
            this.selectResultEntry(this.entry)
        },
        onMouseOver: function () {},
        onMouseLeave: function () {},
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.search-category-entry {
    @include media-breakpoint-up(sm) {
        &:hover {
            background-color: $dark;
            color: $light;
        }
    }
}
</style>
