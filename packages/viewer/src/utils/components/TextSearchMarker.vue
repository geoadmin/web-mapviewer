<script setup lang="ts">
/**
 * Component to mark matching pattern within a text using HTML element in a safe manner.
 *
 * <span>{{ non_matching }}</span> <span :class="classes">{{ matching_pattern }}</span> <span>{{
 * non_matching }}</span>
 */
import { computed } from 'vue'

import { segmentizeMatch } from '@/utils/utils'

interface Props {
    /** Text to mark matching pattern */
    text: string
    /** Allow HTML tags in text - WARNING: Should only be used if the text source is safe! */
    allowHtml?: boolean
    /** Search pattern to match for marking in text. Can be either a string or a Regular Expression */
    search?: string | RegExp
    /** List of class to use as markers for matching text */
    markers?: string[] | string
}

const props = withDefaults(defineProps<Props>(), {
    allowHtml: false,
    search: '',
    markers: () => ['fw-bold', 'bg-info', 'bg-opacity-25'],
})

const segments = computed(() => segmentizeMatch(props.text, props.search))

const emit = defineEmits<{
    click: []
}>()

function getClasses(match: boolean): string[] | string {
    if (match) {
        return props.markers
    }
    return []
}
</script>

<template>
    <span
        v-if="allowHtml"
        @click="emit('click')"
    >
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
    <span
        v-else
        @click="emit('click')"
    >
        <span
            v-for="(segment, index) in segments"
            :key="`${segment.text}-${index}`"
            :class="getClasses(segment.match)"
            :data-cy="`segment${segment.match ? '-match' : ''}`"
        >
            {{ segment.text }}
        </span>
    </span>
</template>
