<script setup>
/** Component showing one search result entry (and dispatching its selection to the store) */

import { computed, onUnmounted, ref, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import { SearchResultTypes } from '@/api/search.api'
import LayerDescriptionPopup from '@/modules/menu/components/LayerDescriptionPopup.vue'
import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'

const dispatcher = { dispatcher: 'SearchResultListEntry.vue' }

const { index, entry } = defineProps({
    index: {
        type: Number,
        required: true,
    },
    entry: {
        type: Object,
        required: true,
    },
})

const emits = defineEmits([
    'entrySelected',
    'firstEntryReached',
    'lastEntryReached',
    'setPreview',
    'clearPreview',
])

const resultType = computed(() => entry.resultType)
const showLayerDescription = ref(false)

const item = useTemplateRef('item')
const isSetPreview = ref(false)
const store = useStore()
const compact = computed(() => store.getters.isDesktopMode)
const searchQuery = computed(() => store.state.search.query)
const layerName = computed(() => {
    if (resultType.value === SearchResultTypes.LAYER) {
        return store.state.layers.config.find((layer) => layer.id === entry.layerId)?.name
    }
    return null
})

function selectItem() {
    emits('entrySelected')
    emits('clearPreview', entry)
    store.dispatch('selectResultEntry', { entry: entry, ...dispatcher })
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

function clearPreview() {
    if (isSetPreview.value) {
        isSetPreview.value = false
        emits('clearPreview', entry)
    }
}

function setPreview() {
    if (!isSetPreview.value) {
        isSetPreview.value = true
        emits('setPreview', entry)
    }
}

onUnmounted(() => {
    clearPreview()
})

defineExpose({
    goToFirst,
    goToLast,
})
</script>

<template>
    <li
        ref="item"
        class="search-category-entry d-flex"
        :data-cy="`search-result-entry-${resultType.toLowerCase()}`"
        :tabindex="index === 0 ? 0 : -1"
        @keydown.up.prevent="goToPrevious"
        @keydown.down.prevent="goToNext"
        @keydown.home.prevent="goToFirst"
        @keydown.end.prevent="goToLast"
        @keyup.enter="selectItem"
        @mouseenter="setPreview"
        @mouseleave="clearPreview"
        @focusin="setPreview"
        @focusout="clearPreview"
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
                :data-cy="`button-show-description-layer-${entry.layerId}`"
                tabindex="-1"
                @click="showLayerDescription = true"
            >
                <FontAwesomeIcon
                    size="lg"
                    :icon="['fas', 'info-circle']"
                />
            </button>
        </div>
        <LayerDescriptionPopup
            v-if="showLayerDescription"
            :layer-id="entry.layerId"
            :layer-name="layerName"
            @close="showLayerDescription = false"
        />
    </li>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
@import '@/scss/media-query.mixin';

.search-category-entry {
    &-main {
        cursor: pointer;
    }

    &:focus {
        outline-offset: -$focus-outline-size;
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
}
</style>
