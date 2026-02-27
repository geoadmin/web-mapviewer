<script setup lang="ts">
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { nextTick, useTemplateRef } from 'vue'

import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'

const { showList = false, entries = [] } = defineProps<{
    showList?: boolean
    entries?: Array<{ htmlDisplay: string; emphasize: string; year: number }>
}>()

const emit = defineEmits(['chooseEntry', 'hide'])

const searchListEntries = useTemplateRef<HTMLDivElement[]>('searchListEntries')

function goToSpecific(value: number) {
    const key = entries.findIndex((entry) => entry.year === value)
    if (key >= 0) {
        const elem = searchListEntries.value.find(
            (entry) => entry.getAttribute('tabindex') === key.toString()
        )
        nextTick(() => {
            elem?.scrollIntoView()
            elem?.focus()
        }).catch((error) => {
            log.error({
                title: 'TimeSliderDropdownSearchList.vue',
                titleColor: LogPreDefinedColor.Red,
                messages: ['Error in TimeSliderDropdownSearchList.vue goToSpecific:', error],
            })
        })
    }
}

function goToPrevious(currentKey: number) {
    if (currentKey > 0) {
        const key = currentKey - 1
        const elem = searchListEntries.value.find(
            (entry) => entry.getAttribute('tabindex') === key.toString()
        )
        elem?.focus()
    }
}

function goToNext(currentKey: number) {
    if (currentKey < entries.length - 1) {
        const key = currentKey + 1
        const elem = searchListEntries.value.find(
            (entry) => entry.getAttribute('tabindex') === key.toString()
        )
        elem?.focus()
    }
}

function goToFirst() {
    const elem = searchListEntries.value.find((entry) => entry.getAttribute('tabindex') === '0')
    elem?.focus()
}

function goToLast() {
    const elem = searchListEntries.value.find(
        (entry) => entry.getAttribute('tabindex') === (entries.length - 1).toString()
    )
    elem?.focus()
}

defineExpose({ goToFirst, goToSpecific })
</script>

<template>
    <div
        v-show="showList"
        class="entries-list-container rounded-bottom overflow-auto border shadow"
    >
        <div class="entries-list">
            <div
                v-for="(entry, key) in entries"
                :key="JSON.stringify(entry)"
                :tabindex="key"
                ref="searchListEntries"
                :data-cy="`time-slider-dropdown-entry-${entry.year}`"
                class="entries-list-item px-2 py-1 text-nowrap"
                @keydown.up.prevent="goToPrevious(key)"
                @keydown.down.prevent="() => goToNext(key)"
                @keydown.home.prevent="goToFirst"
                @keydown.end.prevent="goToLast"
                @keydown.esc.prevent="emit('hide')"
                @keydown.enter.prevent="emit('chooseEntry', entry.year)"
                @click="emit('chooseEntry', entry.year)"
            >
                <TextSearchMarker
                    :text="entry.htmlDisplay"
                    :search="entry.emphasize"
                />
            </div>
            <div
                v-show="entries.length === 0"
                class="entries-list-empty px-2 py-1"
            >
                <span>-</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@swissgeo/theme/scss/geoadmin-theme';
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
