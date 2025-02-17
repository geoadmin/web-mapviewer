<script setup>
/**
 * Component to truncate text with elipsis and add a tippy tooltip to truncated text.
 *
 * The tooltip is added/removed when the component is resize and is truncated or not.
 *
 * NOTE: This work only if the slot is a simple text or span elements with text
 *
 * Example
 *
 * <TextTruncate>Text to truncate</TextTruncate>
 *
 * <TextTruncate text="Text to truncate"><span>Text to truncate</span></TextTruncate>
 */
import { computed, onBeforeUnmount, onMounted, ref, useSlots, useTemplateRef } from 'vue'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip.js'

const { text, tippyOptions } = defineProps({
    /**
     * Text to use in tooltip.
     *
     * This text is taken instead of the content of the slot. If not provided and the slot is
     * content is a simple text then the slot content is taken as tooltip
     *
     * @type {string}
     */
    text: {
        type: String,
        default: '',
    },
    /**
     * Tippy options to pass
     *
     * For more details see tippy js documentations
     */
    tippyOptions: {
        type: Object,
        default() {
            return {}
        },
    },
})

const slots = useSlots()

const outerElement = useTemplateRef('outerElement')
const innerElement = useTemplateRef('innerElement')

const outerElementWidth = ref(outerElement.value?.getBoundingClientRect().width ?? 0)
const innerElementWidth = ref(innerElement.value?.getBoundingClientRect().width ?? 0)
// We add a tooltip only if the text is truncated
const showTooltip = computed(() => innerElementWidth.value > outerElementWidth.value)

const tippyContent = computed(() => {
    if (!showTooltip.value) {
        return null
    }
    if (text) {
        return text
    }
    if (
        slots?.default()?.length === 1 &&
        ['string', 'String'].includes(typeof slots?.default()[0]?.children)
    ) {
        return slots.default()[0].children
    }
    return ''
})
const { refreshTippyAttachment } = useTippyTooltip(outerElement, tippyContent, {
    placement: 'right',
    touch: ['hold', 500], // 500ms delay
    ...tippyOptions,
})

let resizeObserver
onMounted(() => {
    // Observe the catalogue entry resize to add/remove tooltip
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(outerElement.value)
})
onBeforeUnmount(() => {
    resizeObserver?.disconnect()
})

function handleResize() {
    outerElementWidth.value = outerElement.value?.getBoundingClientRect().width ?? 0
    innerElementWidth.value = innerElement.value?.getBoundingClientRect().width ?? 0
    refreshTippyAttachment()
}
</script>

<template>
    <div
        ref="outerElement"
        class="text-truncate"
        data-cy="outer-element"
    >
        <span
            ref="innerElement"
            data-cy="inner-element"
        >
            <slot data-cy="slot-element" />
        </span>
    </div>
</template>
