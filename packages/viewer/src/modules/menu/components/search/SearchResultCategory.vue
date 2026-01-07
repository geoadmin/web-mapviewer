<script setup lang="ts">
import type { SearchResult } from '@swissgeo/api'

import { useTemplateRef } from 'vue'

import SearchResultListEntry from '@/modules/menu/components/search/SearchResultListEntry.vue'

const { title, results } = defineProps<{
    title: string
    results: SearchResult[]
}>()

const entries = useTemplateRef('entries')

const emit = defineEmits([
    'entrySelected',
    'firstEntryReached',
    'lastEntryReached',
    'setPreview',
    'clearPreview',
])

function onEntrySelected(entry: SearchResult) {
    emit('entrySelected', entry)
}

function focusFirstEntry() {
    if (entries.value) {
        entries.value[0]?.goToFirst()
    }
}

function focusLastEntry() {
    if (entries.value) {
        entries.value[entries.value.length - 1]?.goToLast()
    }
}

defineExpose({ focusFirstEntry, focusLastEntry })
</script>

<template>
    <div class="search-category">
        <div class="search-category-header text-bg-secondary px-2 py-1">
            {{ title }}
        </div>
        <ul
            class="search-category-body"
            tabindex="-1"
        >
            <SearchResultListEntry
                v-for="(entry, index) in results"
                ref="entries"
                :key="index"
                :index="index"
                :entry="entry"
                data-cy="search-result-entry"
                @entrySelected="onEntrySelected(entry)"
                @firstEntryReached="emit('firstEntryReached')"
                @lastEntryReached="emit('lastEntryReached')"
                @setPreview="emit('setPreview', $event)"
                @clearPreview="emit('clearPreview', $event)"
            />
        </ul>
    </div>
</template>

<style lang="scss" scoped>
@import '@swissgeo/theme/scss/geoadmin-theme';
.search-category {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    &-header {
        flex: none;
        overflow: visible;
        font-size: 0.825rem;
        font-weight: bold;
    }
    &-body {
        flex: initial;
        margin: 0;
        padding: 0;
        list-style: none;
        overflow: auto;
        font-size: 0.8rem;
    }
}
</style>
