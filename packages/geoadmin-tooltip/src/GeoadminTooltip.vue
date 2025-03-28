<script setup lang="ts">
/**
 * A Tooltip Component using floating-ui
 *
 * This tooltip component can be used by wrapping any element with
 *
 *     <GeoadminTooltip>
 *     <whatever-is-tooltipped /> </GeoadminTooltip>
 *     </GeoadminTooltip>
 *
 * The content of the tooltip can be provided in two ways: Either the slot #content is used:
 *
 *     <GeoadminTooltip>
 *     <whatever-is-tooltipped /> </GeoadminTooltip>
 *      <template #content>
 *          My Text to be shown,
 *      </template>
 *     </GeoadminTooltip>
 *
 * Or, for simpler cases, the property tooltip-content can be used.
 *
 * The placement is by default 'top' but can be overridden with the placement prop to 'bottom'
 */

import { autoUpdate, useFloating, shift, arrow, offset, flip } from '@floating-ui/vue'
import { computed, ref, useSlots, useTemplateRef } from 'vue'

const {
    tooltipContent,
    placement: desiredPlacement = 'top',
    disabled = false,
    theme = 'light',
    openTrigger = 'hover',
    noWrap = false,
    useDefaultPadding = false,
} = defineProps<{
    /** @property {tooltipContent} string The text content of the tooltip */
    tooltipContent?: string
    /** @property {placement} enum The desired placement */
    placement?: 'top' | 'bottom' | 'right' | 'left'
    /** @property {disabled} boolean Disable the tooltip */
    disabled?: boolean
    /** @property {theme} enum The tooltip theme */
    theme?: 'light' | 'warning' | 'secondary' | 'danger'
    /** @property {openTrigger} enum How the tooltip shall be triggered */
    openTrigger?: 'hover' | 'click' | 'manual'
    /** @property {noWrap} boolean If whitespace wrapping the content should be avoided */
    noWrap?: boolean
    /** - @property {useDefaultPadding} boolean Use the padding regardless of content slot usage */
    useDefaultPadding?: boolean
}>()

const isShown = ref<boolean>(false)
const isTouching = ref<boolean>(false)

const isOpen = computed<boolean>(() => !disabled && isShown.value)

const tooltipElementRef = useTemplateRef('tooltipElement')
const floatingElementRef = useTemplateRef('floatingElement')
const arrowElementRef = useTemplateRef('arrowElement')

const slots = useSlots()

const { floatingStyles, middlewareData, placement } = useFloating(tooltipElementRef, floatingElementRef, {
    strategy: 'fixed',
    placement: desiredPlacement,
    whileElementsMounted: autoUpdate,
    middleware: [
        shift(), // shift the element to keep it in view
        flip({
            fallbackAxisSideDirection: 'start',
        }), // allow the opposite side if there's not enough space
        offset(10), // offset it to make room for the arrow
        arrow({ element: arrowElementRef }),
    ],
})

/** Extract the data-cy value from the tooltip anchor and */
const dataCyValue = computed((): string => {
    if (tooltipElementRef.value?.children.length) {
        const dataCy = tooltipElementRef.value?.children[0].getAttribute('data-cy')
        if (dataCy) {
            return `floating-${dataCy}`
        }
    }
    return ''
})

// on mobile touching the button is triggering the tooltip for a short moment
// we work around this issue by a) detecting a touch event and b) putting the showing of the
// tooltip in a later render cycle (so that the touch event is processed first)
const openTooltip = (): void => {
    setTimeout(() => {
        isShown.value = true
    }, 1)
}

const closeTooltip = (): void => {
    setTimeout(() => {
        isShown.value = false
    }, 1)
}

const onTouchStart = (): void => {
    isTouching.value = true
}

const onTouchEnd = (): void => {
    // delay the touch end
    setTimeout(() => {
        isTouching.value = false
    }, 500)
}

const onMouseOver = (): void => {
    if (!disabled && openTrigger === 'hover' && !isTouching.value) {
        openTooltip()
    }
}

const onMouseLeave = (): void => {
    if (!disabled && openTrigger === 'hover' && !isTouching.value) {
        closeTooltip()
    }
}

const eventListenerCloser = (event: MouseEvent) => {
    // Don't close when clicked on the tooltip
    if (floatingElementRef.value && !floatingElementRef.value.contains(event.target as Node)) {
        closeTooltip()
        document.removeEventListener('click', eventListenerCloser)
    }
}

const onClick = (event: Event): void => {
    // if we're hovering, make the tooltip go away
    // this is especially important on mobile, because tapping the button will otherwise
    // make it stay!
    if (openTrigger === 'hover') {
        closeTooltip()
    }

    if (openTrigger !== 'click') {
        return
    }

    // add event listener so the user can click anywhere to close the tooltip
    // sadly this triggers the events underneath, too. We currently can't
    // prevent that, as the order is given through the DOM order
    if (isShown.value) {
        closeTooltip()
        document.removeEventListener('click', eventListenerCloser)
    } else {
        openTooltip()
        event.stopPropagation()

        document.addEventListener('click', eventListenerCloser)
    }
}

/**
 * When we have a click triggered tooltip, we don't want the clicks to the tooltip to bubble to the
 * event handler that closes it
 *
 * @param event
 */
const onClickContainer = (event: Event): void => {
    if (isShown.value && openTrigger === 'click') {
        event.stopPropagation()
    }
}

// some components need access to the root element because they
// position it on the map. For the manual triggering the opener and closer are
// needed, too
defineExpose({ tooltipElement: tooltipElementRef, isOpen, openTooltip, closeTooltip })
</script>

<template>
    <div
        data-cy="floating-container"
        @click="onClickContainer"
    >
        <div
            ref="tooltipElement"
            @touchstart="onTouchStart"
            @touchend="onTouchEnd"
            @mouseover="onMouseOver"
            @mouseleave="onMouseLeave"
            @click="onClick"
        >
            <slot :close="closeTooltip" />
        </div>
        <Teleport to="body">
            <div
                v-if="isOpen"
                ref="floatingElement"
                :style="floatingStyles"
                class="tw:z-100 tw:border tw:rounded-sm tw:shadow-md"
                :class="{
                    'tw:bg-white tw:border-gray-200': theme === 'light',
                    'tw:bg-gray-500 tw:border-gray-600 tw:text-white': theme === 'secondary',
                    'tw:bg-amber-300 tw:border-amber-400': theme === 'warning',
                    'tw:bg-red-500 tw:border-red-600 tw:text-white': theme === 'danger',
                    'tw:whitespace-nowrap': noWrap,
                    // if the content slot is used, we delegate the styling to the user
                    // if it's the fallback, then it's a simple tooltip, thus add the padding
                    // if forceExtraPadding is set, we also want the padding
                    'tw:px-2': !slots.content || useDefaultPadding,
                    'tw:py-1': !slots.content || useDefaultPadding,
                }"
                :data-cy="dataCyValue"
            >

                <slot
                    name="content"
                    :close="closeTooltip"
                >
                    {{ tooltipContent }}
                </slot>

                <div
                    v-if="middlewareData.arrow"
                    ref="arrowElement"
                    :style="{
                        left: `${middlewareData.arrow.x}px`,
                        top: `${middlewareData.arrow.y}px`,
                    }"
                    class="tw:absolute tw:h-0 tw:w-0 tw:after:content-[''] tw:after:h-0 tw:after:w-0 tw:after:fixed tw:after:top-[inherit] tw:after:left-[inherit] tw:after:z-[-1]"
                    :class="{
                        'tw:bottom-[-8px] tw:border-x-8 tw:border-x-transparent tw:border-t-8 tw:after:bottom-[-9px] tw:after:border-x-8 tw:after:border-x-transparent tw:after:border-t-8': placement == 'top',
                        'tw:border-t-white tw:after:border-t-gray-200': placement == 'top' && theme == 'light',
                        'tw:border-t-gray-500 tw:after:border-t-gray-600': placement == 'top' && theme == 'secondary',
                        'tw:border-t-amber-300 tw:after:border-t-amber-400': placement == 'top' && theme == 'warning',
                        'tw:border-t-red-500 tw:after:border-t-red-600': placement == 'top' && theme == 'danger',

                        'tw:right-[-8px] tw:border-y-8 tw:border-y-transparent tw:border-l-8 tw:after:right-[-9px] tw:after:border-y-8 tw:after:border-y-transparent tw:after:border-l-8': placement == 'left',
                        'tw:border-l-white tw:after:border-l-gray-200': placement == 'left' && theme == 'light',
                        'tw:border-l-gray-500 tw:after:border-l-gray-600': placement == 'left' && theme == 'secondary',
                        'tw:border-l-amber-300 tw:after:border-l-amber-400': placement == 'left' && theme == 'warning',
                        'tw:border-l-red-500 tw:after:border-l-red-600': placement == 'left' && theme == 'danger',

                        'tw:top-[-8px] tw:border-x-8 tw:border-x-transparent tw:border-b-8 tw:after:top-[-9px] tw:after:border-x-8 tw:after:border-x-transparent tw:after:border-b-8': placement == 'bottom',
                        'tw:border-b-white tw:after:border-b-gray-200': placement == 'bottom' && theme == 'light',
                        'tw:border-b-gray-500 tw:after:border-b-gray-600': placement == 'bottom' && theme == 'secondary',
                        'tw:border-b-amber-300 tw:after:border-b-amber-400': placement == 'bottom' && theme == 'warning',
                        'tw:border-b-red-500 tw:after:border-b-red-600': placement == 'bottom' && theme == 'danger',

                        'tw:left-[-8px] tw:border-y-8 tw:border-y-transparent tw:border-r-8 tw:after:left-[-9px] tw:after:border-y-8 tw:after:border-y-transparent tw:after:border-r-8': placement == 'right',
                        'tw:border-r-white tw:after:border-r-gray-200': placement == 'right' && theme == 'light',
                        'tw:border-r-gray-500 tw:after:border-r-gray-600': placement == 'right' && theme == 'secondary',
                        'tw:border-r-amber-300 tw:after:border-r-amber-400': placement == 'right' && theme == 'warning',
                        'tw:border-r-red-500 tw:after:border-r-red-600': placement == 'right' && theme == 'danger',
                    }"
                ></div>
            </div>
        </Teleport>
    </div>
</template>

<style>
@import '@/style.css';
</style>
