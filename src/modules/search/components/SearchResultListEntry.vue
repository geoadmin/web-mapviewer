<template>
    <div
        class="search-category-entry border-bottom border-light"
        :data-cy="`search-result-entry-${resultType}`"
    >
        <div class="search-category-entry-main p-2 ps-4" @click="onClick">
            <!-- eslint-disable-next-line vue/no-v-html-->
            <span v-html="entry.title"></span>
        </div>

        <div v-if="resultType == 'layer'" class="search-category-entry-controls">
            <button
                class="btn btn-default"
                :data-cy="`button-show-legend-layer-${entry.layerId}`"
                @click="showLayerLegendPopup"
            >
                <font-awesome-icon size="lg" :icon="['fas', 'info-circle']" />
            </button>
        </div>
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
    emits: ['showLayerLegendPopup'],
    computed: {
        resultType() {
            return this.entry.resultType.toLowerCase()
        },
    },
    methods: {
        ...mapActions(['selectResultEntry']),
        onClick() {
            this.selectResultEntry(this.entry)
        },
        showLayerLegendPopup() {
            this.$emit('showLayerLegendPopup', this.entry.layerId)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.search-category-entry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 3rem;
    &-main {
        flex-grow: 1;
        cursor: pointer;
    }
    @include media-breakpoint-up(sm) {
        &:hover {
            background-color: $dark;
            color: $light;
            .btn {
                color: $light;
            }
        }
        .btn {
            // Same (no) transition on button and list-item.
            transition: unset;
        }
    }
}
</style>
