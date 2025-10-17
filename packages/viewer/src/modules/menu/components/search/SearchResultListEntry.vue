<script setup lang="ts">
/** Component showing one search result entry (and dispatching its selection to the store) */

import { computed, onUnmounted, ref, useTemplateRef } from 'vue'

import { SearchResultTypes, type SearchResult } from '@/api/search.api'
import LayerDescriptionPopup from '@/modules/menu/components/LayerDescriptionPopup.vue'
import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'
import useUIStore from '@/store/modules/ui.store'
import useSearchStore from '@/store/modules/search.store'
import useLayersStore from '@/store/modules/layers.store'
import log from '@swissgeo/log'

const dispatcher = { name: 'SearchResultListEntry.vue' }

const { index, entry } = defineProps<{
    index: number
    entry: SearchResult
}>()

const emits = defineEmits([
    'entrySelected',
    'firstEntryReached',
    'lastEntryReached',
    'setPreview',
    'clearPreview',
])

const uiStore = useUIStore()
const searchStore = useSearchStore()
const layersStore = useLayersStore()

const resultType = computed(() => entry.resultType)
const showLayerDescription = ref(false)

const item = useTemplateRef<HTMLLIElement>('item')
const isSetPreview = ref(false)

const compact = computed(() => uiStore.isDesktopMode)
const searchQuery = computed(() => searchStore.query)

const layerName = computed(() => {
    if (resultType.value === SearchResultTypes.LAYER) {
        return layersStore.config.find((layer) => layer.id === entry.id)?.name
    }
    return undefined
})

function selectItem() {
    emits('entrySelected')
    emits('clearPreview', entry)

    searchStore.selectResultEntry(entry, dispatcher).catch(() => {
        log.error({ messages: ['Unable to select search Result'] })
    })
}

function goToFirst() {
    if (!item.value) {
        return
    }
    ;(item.value.parentElement!.firstElementChild as HTMLLIElement)?.focus()
}

function goToPrevious() {
    if (!item.value || !item.value.previousElementSibling) {
        return
    }

    if (item.value.previousElementSibling) {
        ;(item.value.previousElementSibling as HTMLLIElement).focus()
    } else {
        emits('firstEntryReached')
    }
}

function goToNext() {
    if (!item.value || !item.value.nextElementSibling) {
        return
    }

    if (item.value.nextElementSibling) {
        ;(item.value.nextElementSibling as HTMLLIElement).focus()
    } else {
        emits('lastEntryReached')
    }
}

function goToLast() {
    if (!item.value || !item.value.parentElement) {
        return
    }
    ;(item.value.parentElement.lastElementChild as HTMLLIElement)?.focus()
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
            class="search-category-entry-main flex-grow-1 px-2"
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
                :data-cy="`button-show-description-layer-${entry.id}`"
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
            :layer-id="entry.id"
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
