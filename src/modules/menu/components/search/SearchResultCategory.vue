<script setup>
import { ref, toRefs } from 'vue'

import SearchResultListEntry from '@/modules/menu/components/search/SearchResultListEntry.vue'

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    results: {
        type: Array,
        required: true,
    },
})

const { title, results } = toRefs(props)
const entries = ref(null)
const emit = defineEmits(['entrySelected', 'firstEntryReached', 'lastEntryReached'])

function onEntrySelected(entry) {
    emit('entrySelected', entry)
}

function focusFirstEntry() {
    entries.value[0].goToFirst()
}

function focusLastEntry() {
    entries.value[entries.value.length - 1].goToLast()
}

defineExpose({ focusFirstEntry, focusLastEntry })
</script>

<template>
    <div class="search-category">
        <div class="search-category-header px-2 py-1 text-bg-secondary">
            {{ title }}
        </div>
        <ul class="search-category-body" tabindex="-1">
            <SearchResultListEntry
                v-for="(entry, index) in results"
                ref="entries"
                :key="index"
                :index="index"
                :entry="entry"
                @entry-selected="onEntrySelected(entry)"
                @first-entry-reached="emit('firstEntryReached')"
                @last-entry-reached="emit('lastEntryReached')"
            />
        </ul>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
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
