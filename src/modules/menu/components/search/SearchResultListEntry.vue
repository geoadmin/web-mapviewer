<template>
    <li
        ref="item"
        class="search-category-entry border-bottom border-light"
        :data-cy="`search-result-entry-${resultType}`"
        :tabindex="index === 0 ? 0 : -1"
        @keydown.up.prevent="goToPrevious"
        @keydown.down.prevent="goToNext"
        @keydown.home.prevent="goToFirst"
        @keydown.end.prevent="goToLast"
        @keypress.enter.prevent="selectItem"
        @mouseenter="previewResult(true)"
        @mouseleave="previewResult(false)"
    >
        <!-- eslint-disable vue/no-v-html-->
        <div class="search-category-entry-main p-2" @click="selectItem" v-html="entry.title"></div>

        <div v-if="resultType === 'layer'" class="search-category-entry-controls">
            <button
                class="btn btn-default"
                :data-cy="`button-show-legend-layer-${entry.layerId}`"
                tabindex="-1"
                @click="showLayerLegendPopup"
            >
                <FontAwesomeIcon size="lg" :icon="['fas', 'info-circle']" />
            </button>
        </div>
    </li>
</template>

<script>
import { mapActions } from 'vuex'
import { SearchResult } from '@/api/search.api'

/** Component showing one search result entry (and dispatching its selection to the store) */
export default {
    props: {
        index: {
            type: Number,
            required: true,
        },
        entry: {
            type: SearchResult,
            required: true,
        },
    },
    emits: ['showLayerLegendPopup', 'preview'],
    computed: {
        resultType() {
            return this.entry.resultType.toLowerCase()
        },
    },
    methods: {
        ...mapActions(['selectResultEntry']),
        selectItem() {
            this.selectResultEntry(this.entry)
        },
        showLayerLegendPopup() {
            this.$emit('showLayerLegendPopup', this.entry.layerId)
        },
        goToPrevious() {
            this.changeFocus(this.$refs.item.previousElementSibling)
        },
        goToNext() {
            this.changeFocus(this.$refs.item.nextElementSibling)
        },
        goToFirst() {
            this.changeFocus(this.$refs.item.parentElement.firstElementChild)
        },
        goToLast() {
            this.changeFocus(this.$refs.item.parentElement.lastElementChild)
        },
        changeFocus(target) {
            if (target) {
                target.tabIndex = '0'
                target.focus()
                this.$refs.item.tabIndex = '-1'
            }
        },
        previewResult(show) {
            if (this.resultType === 'layer') {
                this.$emit('preview', show ? this.entry.layerId : null)
            } else {
                this.$emit('preview', show ? this.entry.coordinates : null)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.search-category-entry {
    display: flex;
    align-items: center;
    &-main {
        flex-grow: 1;
        cursor: pointer;
    }
    .btn {
        padding-top: 0;
        padding-bottom: 0;
        line-height: 1;
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
