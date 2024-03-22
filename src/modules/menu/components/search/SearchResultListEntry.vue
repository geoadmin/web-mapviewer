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
        <TextSearchMarker
            class="search-category-entry-main px-2 flex-grow-1"
            :class="{ 'py-1': compact, 'py-2': !compact }"
            :text="entry.title"
            :search="searchQuery"
            allow-html
            @click="selectItem"
        />

        <div v-if="resultType === 'layer'" class="search-category-entry-controls flex-grow-0">
            <button
                class="btn btn-default"
                :class="{ 'btn-xs': compact }"
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
import { mapActions, mapGetters, mapState } from 'vuex'

import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'

const dispatcher = { dispatcher: 'SearchResultListEntry.vue' }

/** Component showing one search result entry (and dispatching its selection to the store) */
export default {
    components: { TextSearchMarker },
    props: {
        index: {
            type: Number,
            required: true,
        },
        entry: {
            type: Object,
            required: true,
        },
    },
    emits: ['showLayerLegendPopup', 'entrySelected', 'firstEntryReached', 'lastEntryReached'],
    computed: {
        ...mapGetters(['isDesktopMode']),
        ...mapState({
            searchQuery: (state) => state.search.query,
        }),
        compact() {
            return this.isDesktopMode
        },
        resultType() {
            return this.entry.resultType.toLowerCase()
        },
    },
    methods: {
        ...mapActions([
            'selectResultEntry',
            'setPreviewedPinnedLocation',
            'setPreviewLayer',
            'clearPreviewLayer',
        ]),
        selectItem() {
            this.$emit('entrySelected')
            this.selectResultEntry({ entry: this.entry, ...dispatcher })
        },
        showLayerLegendPopup() {
            this.$emit('showLayerLegendPopup', this.entry)
        },
        goToPrevious() {
            if (this.$refs.item.previousElementSibling) {
                this.changeFocus(this.$refs.item.previousElementSibling)
            } else {
                this.$emit('firstEntryReached')
            }
        },
        goToNext() {
            if (this.$refs.item.nextElementSibling) {
                this.changeFocus(this.$refs.item.nextElementSibling)
            } else {
                this.$emit('lastEntryReached')
            }
        },
        goToFirst() {
            this.changeFocus(this.$refs.item.parentElement.firstElementChild)
        },
        goToLast() {
            this.changeFocus(this.$refs.item.parentElement.lastElementChild)
        },
        changeFocus(target) {
            if (target) {
                target.focus()
            }
        },
        startResultPreview() {
            if (this.resultType === 'layer') {
                this.setPreviewLayer({
                    layer: this.entry.layerId,
                    ...dispatcher,
                })
            } else {
                this.setPreviewedPinnedLocation({
                    coordinates: this.entry.coordinates,
                    ...dispatcher,
                })
            }
        },
        stopResultPreview() {
            if (this.resultType === 'layer') {
                this.clearPreviewLayer(dispatcher)
            } else {
                this.setPreviewedPinnedLocation({ coordinates: null, ...dispatcher })
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
            background-color: $list-item-hover-bg-color;
        }
        .btn {
            // Same (no) transition on button and list-item.
            transition: unset;
        }
    }
    &:focus {
        outline-offset: -$focus-outline-size;
    }
}
</style>
