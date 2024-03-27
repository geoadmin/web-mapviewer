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
     * Allow HTML tags in text
     *
     * @type {Boolean}
     * @WARNING Should only be used if the text source is safe !
     */
    allowHtml: { type: Boolean, default: false },
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
     * @default ['fw-bolder', 'bg-info', 'bg-opacity-25'] Default to bold
     * @type {[String]}
     */
    markers: {
        type: [Array, String],
        default: new Array(['fw-bold', 'bg-info', 'bg-opacity-25']),
    },
})
const { text, search, markers } = toRefs(props)

const segments = computed(() => segmentizeMatch(text.value, search.value))

const emit = defineEmits(['click'])

function getClasses(match) {
    if (match) {
        return markers.value
    }
    return []
}
</script>

<template>
    <span v-if="allowHtml" @click="emit('click')">
        <!-- eslint-disable vue/no-v-html-->
        <span
            v-for="(segment, index) in segments"
            :key="`${segment.text}-${index}`"
            :class="getClasses(segment.match)"
            :data-cy="`segment${segment.match ? '-match' : ''}`"
            v-html="segment.text"
        />
        <!-- eslint-enable vue/no-v-html-->
    </span>
    <span v-else @click="emit('click')">
        <span
            v-for="(segment, index) in segments"
            :key="`${segment.text}-${index}`"
            :class="getClasses(segment.match)"
            :data-cy="`segment${segment.match ? '-match' : ''}`"
            >{{ segment.text }}</span
        >
    </span>
</template>
