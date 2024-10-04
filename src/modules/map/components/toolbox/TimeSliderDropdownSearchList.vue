<script setup>
import { nextTick, ref, toRefs } from 'vue'

import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'

const props = defineProps({
    showList: {
        type: Boolean,
        default: false,
    },
    entries: {
        type: Array /* Array of Entries */,
        default() {
            return []
        },
    },
})

const emit = defineEmits(['chooseEntry'])

const { showList, entries } = toRefs(props)
const searchList = ref(null)

function goToSpecific(value) {
    const key = entries.value.findIndex((entry) => {
        return entry.url === value
    })
    if (key >= 0) {
        const elem = searchList.value.querySelector(`[tabindex="${key}"]`)
        nextTick(() => {
            elem.scrollIntoView()
            elem.focus()
        })
    }
}

function goToPrevious(currentKey) {
    if (currentKey === 0) {
        return
    }
    const key = currentKey - 1
    searchList.value.querySelector(`[tabindex="${key}"]`).focus()
}

function goToNext(currentKey) {
    if (currentKey >= entries.value.length - 1) {
        return
    }
    const key = currentKey + 1
    searchList.value.querySelector(`[tabindex="${key}"]`).focus()
}

function goToFirst() {
    searchList.value.querySelector('[tabindex="0"]').focus()
}

function goToLast() {
    searchList.value.querySelector(`[tabindex="${entries.value.length - 1}"]`).focus()
}

defineExpose({ goToFirst, goToSpecific })
</script>

<template>
    <div
        v-show="showList"
        class="entries-list-container shadow border rounded-bottom overflow-auto"
    >
        <div ref="searchList" class="entries-list">
            <div
                v-for="(entry, key) in entries"
                :key="entry"
                :tabindex="key"
                class="entries-list-item px-2 py-1 text-nowrap"
                @keydown.up.prevent="goToPrevious(key)"
                @keydown.down.prevent="() => goToNext(key)"
                @keydown.home.prevent="goToFirst"
                @keydown.end.prevent="goToLast"
                @keydown.esc.prevent="showList = false"
                @keydown.enter.prevent="emit('chooseEntry', entry.url)"
                @click="emit('chooseEntry', entry.url)"
            >
                <TextSearchMarker :text="entry.htmlDisplay" :search="entry.emphasize" />
            </div>
            <div v-show="entries.length === 0" class="entries-list-empty px-2 py-1">
                <span>-</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
.entries-list-container {
    max-height: 13rem;

    .entries-list {
        .entries-list-empty {
            user-select: none;
        }

        .entries-list-item {
            cursor: pointer;
        }
        .entries-list-item:focus,
        .entries-list-item:hover {
            background-color: $list-item-hover-bg-color;
        }
    }
}
</style>
