<template>
    <li
        ref="item"
        class="search-category-entry d-flex"
        :data-cy="`search-result-entry-${resultType}`"
        :tabindex="index === 0 ? 0 : -1"
        @keydown.up.prevent="goToPrevious"
        @keydown.down.prevent="goToNext"
        @keydown.home.prevent="goToFirst"
        @keydown.end.prevent="goToLast"
        @keyup.enter="selectItem"
        @mouseenter="startResultPreview"
        @mouseleave="stopResultPreview"
    >
        <!-- eslint-disable vue/no-v-html-->
        <div
            class="search-category-entry-main p-2 flex-grow-1"
            @click="selectItem"
            v-html="entry.title"
        ></div>

        <div v-if="resultType === 'layer'" class="search-category-entry-controls flex-grow-0">
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
import { SearchResult } from '@/api/search.api'
import { mapActions } from 'vuex'

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
    emits: ['showLayerLegendPopup'],
    computed: {
        resultType() {
            return this.entry.resultType.toLowerCase()
        },
    },
    methods: {
        ...mapActions([
            'selectResultEntry',
            'setPinnedLocation',
            'setPreviewedPinnedLocation',
            'clearPinnedLocation',
            'setPreviewLayer',
            'clearPreviewLayer',
        ]),
        selectItem() {
            this.selectResultEntry(this.entry)
        },
        showLayerLegendPopup() {
            this.$emit('showLayerLegendPopup')
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
        startResultPreview() {
            if (this.resultType === 'layer') {
                this.setPreviewLayer(this.entry.layerId)
            } else {
                this.setPreviewedPinnedLocation(this.entry.coordinates)
            }
        },
        stopResultPreview() {
            if (this.resultType === 'layer') {
                this.clearPreviewLayer()
            } else {
                this.setPreviewedPinnedLocation(null)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
@import 'src/scss/media-query.mixin';
.search-category-entry {
    &-main {
        cursor: pointer;
    }
    @include respond-above(phone) {
        &:hover {
            background-color: $secondary;
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
