<script setup>
/**
 * Component to mark matching pattern within a text using HTML element in a safe manner.
 *
 * <span>{{ non_matching }}</span> <span :class="classes">{{ matching_pattern }}</span> <span>{{
 * non_matching }}</span>
 */
import { computed, toRefs } from 'vue'

import { segmentizeMatch } from '@/utils/utils'

const props = defineProps({
    /**
     * Text to mark matching pattern
     *
     * @type {String}
     */
    text: {
        type: String,
        required: true,
    },
    /**
     * Search pattern to match for marking in text. Can be either a string or a Regular Expression
     *
     * @default '' Empty string
     * @type {String | RegExp}
     */
    search: {
        type: [String, RegExp],
        default: '',
    },
    /**
     * List of class to use as markers for matching text.
     *
     * @default ['fw-bold'] Default to bold
     * @type {[String]}
     */
    markers: {
        type: Array,
        default: new Array('fw-bold'),
    },
})
const { text, search, markers } = toRefs(props)

const segments = computed(() => segmentizeMatch(text.value, search.value))

function getClasses(match) {
    if (match) {
        return markers.value
    }
    return []
}
</script>

<template>
    <span
        v-for="(segment, index) in segments"
        :key="`${segment.text}-${index}`"
        :class="getClasses(segment.match)"
        :data-cy="`segment${segment.match ? '-match' : ''}`"
        >{{ segment.text }}</span
    >
</template>
