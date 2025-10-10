<script setup lang="ts">
/**
 * Component to truncate text with elipsis and add a tooltip to truncated text.
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
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, onBeforeUnmount, onMounted, ref, useSlots, useTemplateRef } from 'vue'

interface Props {
    /**
     * Text to use in tooltip.
     *
     * This text is taken instead of the content of the slot. If not provided and the slot is
     * content is a simple text then the slot content is taken as tooltip
     */
    text?: string
    tooltipPlacement?: string
    dataCy?: string
}

const props = withDefaults(defineProps<Props>(), {
    text: '',
    tooltipPlacement: 'top',
    dataCy: '',
})

const slots = useSlots()

const outerElement = useTemplateRef<InstanceType<typeof GeoadminTooltip>>('outerElement')
const innerElement = useTemplateRef<HTMLSpanElement>('innerElement')

const outerElementWidth = ref(
    outerElement.value?.tooltipElement?.getBoundingClientRect().width ?? 0
)
const innerElementWidth = ref(innerElement.value?.getBoundingClientRect().width ?? 0)
// We add a tooltip only if the text is truncated
const showTooltip = computed(() => innerElementWidth.value > outerElementWidth.value)

const tooltipContent = computed(() => {
    if (!showTooltip.value) {
        return null
    }
    if (props.text) {
        return props.text
    }
    if (
        slots?.default()?.length === 1 &&
        ['string', 'String'].includes(typeof slots?.default()[0]?.children)
    ) {
        return slots.default()[0].children as string
    }
    return ''
})

let resizeObserver: ResizeObserver | undefined

onMounted(() => {
    // Observe the catalogue entry resize to add/remove tooltip
    resizeObserver = new ResizeObserver(handleResize)
    if (outerElement.value?.tooltipElement) {
        resizeObserver.observe(outerElement.value.tooltipElement)
    }
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
})

function handleResize(): void {
    outerElementWidth.value = outerElement.value?.tooltipElement?.getBoundingClientRect().width ?? 0
    innerElementWidth.value = innerElement.value?.getBoundingClientRect().width ?? 0
}
</script>

<template>
    <GeoadminTooltip
        ref="outerElement"
        :tooltip-content="tooltipContent"
        :disabled="!showTooltip"
        :placement="tooltipPlacement"
        class="text-truncate"
    >
        <span
            ref="innerElement"
            :data-cy="dataCy"
        >
            <slot data-cy="slot-element" />
        </span>
    </GeoadminTooltip>
</template>
