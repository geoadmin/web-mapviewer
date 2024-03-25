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
import tippy from 'tippy.js'
import { computed, onMounted, onUnmounted, ref, toRefs, useSlots, watch } from 'vue'

let tippyInstance = null
let resizeObserver = null

const props = defineProps({
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
const { text, tippyOptions } = toRefs(props)

const slots = useSlots()

const outterElement = ref(null)
const innerElement = ref(null)

const tippyContent = computed(() => {
    if (text.value) {
        return text.value
    }
    if (
        slots?.default()?.length === 1 &&
        ['string', 'String'].includes(typeof slots?.default()[0]?.children)
    ) {
        return slots.default()[0].children
    }
    return ''
})

watch(tippyContent, (newValue) => tippyInstance?.setContent(newValue))

onMounted(() => {
    initializeTippy()

    // Observe the catalogue entry resize to add/remove tooltip
    resizeObserver = new ResizeObserver(() => initializeTippy())
    resizeObserver.observe(outterElement.value)
})

onUnmounted(() => {
    resizeObserver?.disconnect()
    tippyInstance?.destroy()
    tippyInstance = null
})

function initializeTippy() {
    if (tippyInstance) {
        tippyInstance.unmount()
        tippyInstance.destroy()
        tippyInstance = null
    }
    // We add a tooltip only if the text is truncated
    if (
        innerElement.value?.getBoundingClientRect().width >
        outterElement.value?.getBoundingClientRect().width
    ) {
        tippyInstance = tippy(outterElement.value, {
            content: tippyContent.value,
            arrow: true,
            delay: 500,
            touch: ['hold', 500], // 500ms delay
            ...tippyOptions.value,
        })
    }
}
</script>

<template>
    <div ref="outterElement" class="text-truncate" data-cy="outter-element">
        <span ref="innerElement" data-cy="inner-element">
            <slot data-cy="slot-element" />
        </span>
    </div>
</template>
