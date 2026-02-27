<script setup lang="ts">
/**
 * A Tooltip Component using floating-ui
 *
 * The content of the tooltip can be provided in two ways:
 *
 * - By wrapping any element with it
 * - By providing the slot #content
 *
 * Or, for simpler cases, the property tooltip-content can be used. The placement is by default
 * 'top' but can be overridden with the placement prop to 'bottom' / 'left' / 'right'.
 *
 * @example <caption>Using props to pass the tooltip content</caption>
 *     ;<SwissGeoTooltip
 *         tooltip-content="My Text to be shown"
 *         placement="bottom"
 *     >
 *         <whatever-is-tooltipped />
 *     </SwissGeoTooltip>
 *
 * @example <caption>Using slot to pass the tooltip content (with HTML tags and possibly interactive elements)</caption>
 *     ;<SwissGeoTooltip placement="bottom">
 *         <whatever-is-tooltipped />
 *         <template #content>
 *             My complex <strong>text</strong> to be shown
 *             <button>Do something</button>
 *         </template>
 *     </SwissGeoTooltip>
 */
import { computed, ref } from 'vue'

const {
    tooltipContent = '',
    placement: desiredPlacement = 'top',
    disabled = false,
    theme = 'light',
} = defineProps<{
    /** The text content of the tooltip */
    tooltipContent?: string
    /** The desired placement */
    placement?: 'top' | 'bottom' | 'right' | 'left'
    /** Disable the tooltip */
    disabled?: boolean
    /** The tooltip theme */
    theme?: 'light' | 'warning' | 'secondary' | 'error'
}>()

const open = ref<boolean>(false)

const textColor = computed<string>(() => {
    if (theme === 'secondary') {
        return 'text-gray-50'
    }
    if (theme === 'warning') {
        return 'text-amber-800'
    }
    if (theme === 'error') {
        return 'text-red-800'
    }
    return 'text-gray-800'
})
const tooltipThemeClasses = computed<string>(() => {
    if (theme === 'secondary') {
        return `p-4 border-gray-500 bg-gray-400 ${textColor.value}`
    }
    if (theme === 'warning') {
        return `p-4 border-amber-300 bg-amber-200 ${textColor.value}`
    }
    if (theme === 'error') {
        return `p-4 border-red-300 bg-red-200 ${textColor.value}`
    }
    return 'p-4'
})
const arrowThemeClasses = computed<string>(() => {
    if (theme === 'secondary') {
        return 'fill-gray-500'
    }
    if (theme === 'warning') {
        return 'fill-amber-300'
    }
    if (theme === 'error') {
        return 'fill-red-300'
    }
    return ''
})
</script>

<template>
    <UTooltip
        v-model:open="open"
        :content="{
            side: desiredPlacement,
        }"
        :disabled="disabled"
        :delay-duration="50"
        :ui="{
            content: tooltipThemeClasses,
            arrow: arrowThemeClasses,
            text: 'text-base',
        }"
        :text="tooltipContent"
        :arrow="{
            width: 15,
            height: 7.5,
        }"
    >
        <slot />
        <template
            v-if="$slots.content"
            #content
        >
            <slot name="content" />
        </template>
    </UTooltip>
</template>
