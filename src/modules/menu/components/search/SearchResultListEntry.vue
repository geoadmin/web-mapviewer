<script setup>
/** Component showing one search result entry (and dispatching its selection to the store) */

import { computed, ref, toRefs } from 'vue'
import { useStore } from 'vuex'

import { SearchResultTypes } from '@/api/search.api'
import LayerLegendPopup from '@/modules/menu/components/LayerLegendPopup.vue'
import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'

const dispatcher = { dispatcher: 'SearchResultListEntry.vue' }

const props = defineProps({
    index: {
        type: Number,
        required: true,
    },
    entry: {
        type: Object,
        required: true,
    },
})

const emits = defineEmits(['entrySelected', 'firstEntryReached', 'lastEntryReached'])

const { index, entry } = toRefs(props)

const resultType = computed(() => entry.value.resultType)
const showLayerLegend = ref(false)

const item = ref(null)

const store = useStore()
const compact = computed(() => store.getters.isDesktopMode)
const searchQuery = computed(() => store.state.search.query)
const layerName = computed(() => {
    if (resultType.value === SearchResultTypes.LAYER) {
        return store.state.layers.config.find((layer) => layer.id === entry.value.layerId)?.name
    }
    return null
})

function selectItem() {
    emits('entrySelected')
    store.dispatch('selectResultEntry', { entry: entry.value, ...dispatcher })
}

function goToFirst() {
    item.value.parentElement.firstElementChild?.focus()
}
function goToPrevious() {
    if (item.value.previousElementSibling) {
        item.value.previousElementSibling.focus()
    } else {
        emits('firstEntryReached')
    }
}
function goToNext() {
    if (item.value.nextElementSibling) {
        item.value.nextElementSibling.focus()
    } else {
        emits('lastEntryReached')
    }
}

function goToLast() {
    item.value.parentElement.lastElementChild?.focus()
}

function startResultPreview() {
    if (resultType.value === SearchResultTypes.LAYER) {
        store.dispatch('setPreviewLayer', {
            layer: entry.value.layerId,
            ...dispatcher,
        })
    } else if (entry.value.coordinate) {
        store.dispatch('setPreviewedPinnedLocation', {
            coordinates: entry.value.coordinate,
            ...dispatcher,
        })
    }
}
function stopResultPreview() {
    if (resultType.value === SearchResultTypes.LAYER) {
        store.dispatch('clearPreviewLayer', dispatcher)
    } else {
        store.dispatch('setPreviewedPinnedLocation', { coordinates: null, ...dispatcher })
    }
}
</script>

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

        <div
            v-if="resultType === SearchResultTypes.LAYER"
            class="search-category-entry-controls flex-grow-0"
        >
            <button
                class="btn btn-default"
                :class="{ 'btn-xs': compact }"
                :data-cy="`button-show-legend-layer-${entry.layerId}`"
                tabindex="-1"
                @click="showLayerLegend = true"
            >
                <FontAwesomeIcon size="lg" :icon="['fas', 'info-circle']" />
            </button>
        </div>
        <LayerLegendPopup
            v-if="showLayerLegend"
            :layer-id="entry.layerId"
            :layer-name="layerName"
            @close="showLayerLegend = false"
        />
    </li>
</template>

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
