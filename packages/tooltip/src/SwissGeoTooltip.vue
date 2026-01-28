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

import { arrow, autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { computed, ref, useSlots, useTemplateRef } from 'vue'

const {
    tooltipContent = '',
    placement: desiredPlacement = 'top',
    disabled = false,
    theme = 'light',
    openTrigger = 'hover',
    noWrap = false,
    useDefaultPadding = false,
} = defineProps<{
    /** The text content of the tooltip */
    tooltipContent?: string
    /** The desired placement */
    placement?: 'top' | 'bottom' | 'right' | 'left'
    /** Disable the tooltip */
    disabled?: boolean
    /** The tooltip theme */
    theme?: 'light' | 'warning' | 'secondary' | 'danger'
    /** How the tooltip shall be triggered */
    openTrigger?: 'hover' | 'click' | 'manual'
    /** If whitespaces wrapping the content should be avoided */
    noWrap?: boolean
    /** - @property {useDefaultPadding} boolean Use the padding regardless of content slot usage */
    useDefaultPadding?: boolean
}>()

const isShown = ref<boolean>(false)
const isTouching = ref<boolean>(false)

const isOpen = computed<boolean>(() => !disabled && isShown.value)

const tooltipElementRef = useTemplateRef<HTMLElement>('tooltipElement')
const floatingElementRef = useTemplateRef<HTMLElement>('floatingElement')
const arrowElementRef = useTemplateRef<HTMLElement>('arrowElement')

const slots = useSlots()

const { floatingStyles, middlewareData, placement } = useFloating(
    tooltipElementRef,
    floatingElementRef,
    {
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
    }
)

/** Extract the data-cy value from the tooltip anchor and */
const dataCyValue = computed((): string => {
    if (tooltipElementRef.value?.children.length) {
        const dataCy = tooltipElementRef.value?.children[0]?.getAttribute('data-cy')
        if (dataCy) {
            return `floating-${dataCy}`
        }
    }
    return ''
})

// On mobile, touching the element is triggering/showing the tooltip for a short moment.
// We work around this issue by:
//   a) detecting a touch event
//   b) putting the showing of the tooltip in a later render cycle (so that the touch event is processed first)
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

let touchesOnTouchStart: TouchList | undefined
let touchDidntMove = false
const onTouchStart = (event: TouchEvent): void => {
    isTouching.value = true
    touchesOnTouchStart = event.touches
    touchDidntMove = true
    // after a short "press" (one finger, same spot) on mobile/touch, we show the tooltip
    setTimeout(() => {
        if (touchDidntMove && isTouching.value) {
            openTooltip()
        }
    }, 500)
}

// Keeping track of the starting position/ending position from touches.
// This is done to prevent a touch and drag that starts on the element to show the tooltip
// (the gesture ends out of the element, no tooltip should be shown)
const onTouchMove = (event: TouchEvent): void => {
    const changedTouches: TouchList = event.changedTouches
    for (let i = 0; i < changedTouches.length; i++) {
        const changedTouch = changedTouches.item(i)
        const startingTouch = touchesOnTouchStart?.item(i)
        if (startingTouch && changedTouch) {
            const dx = changedTouch.clientX - startingTouch.clientX
            const dy = changedTouch.clientY - startingTouch.clientY
            // a delta of 10 pixels on any "touch" is considered a move
            touchDidntMove = Math.abs(dx) + Math.abs(dy) < 10
        }
    }
}

const onTouchEnd = (): void => {
    touchDidntMove = false
    // delay the touch end
    setTimeout(() => {
        isTouching.value = false
    }, 1000)
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
        class="h-auto max-w-full"
        :class="{ 'select-none': isTouching }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @click="onClickContainer"
    >
        <div
            ref="tooltipElement"
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
                class="z-100 rounded-sm border shadow-md"
                :class="{
                    'border-gray-200 bg-white': theme === 'light',
                    'border-gray-600 bg-gray-500 text-white': theme === 'secondary',
                    'border-amber-400 bg-amber-300': theme === 'warning',
                    'border-red-600 bg-red-500 text-white': theme === 'danger',
                    'whitespace-nowrap': noWrap,
                    // if the content slot is used, we delegate the styling to the user
                    // if it's the fallback, then it's a simple tooltip, thus add the padding
                    // if forceExtraPadding is set, we also want the padding
                    'px-2': !slots.content || useDefaultPadding,
                    'py-1': !slots.content || useDefaultPadding,
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
                    class="absolute h-0 w-0 after:fixed after:top-[inherit] after:left-[inherit] after:z-[-1] after:h-0 after:w-0 after:content-['']"
                    :class="{
                        '-bottom-2 border-x-8 border-t-8 border-x-transparent after:-bottom-2.25 after:border-x-8 after:border-t-8 after:border-x-transparent':
                            placement == 'top',
                        'border-t-white after:border-t-gray-200':
                            placement == 'top' && theme == 'light',
                        'border-t-gray-500 after:border-t-gray-600':
                            placement == 'top' && theme == 'secondary',
                        'border-t-amber-300 after:border-t-amber-400':
                            placement == 'top' && theme == 'warning',
                        'border-t-red-500 after:border-t-red-600':
                            placement == 'top' && theme == 'danger',

                        '-right-2 border-y-8 border-l-8 border-y-transparent after:-right-2.25 after:border-y-8 after:border-l-8 after:border-y-transparent':
                            placement == 'left',
                        'border-l-white after:border-l-gray-200':
                            placement == 'left' && theme == 'light',
                        'border-l-gray-500 after:border-l-gray-600':
                            placement == 'left' && theme == 'secondary',
                        'border-l-amber-300 after:border-l-amber-400':
                            placement == 'left' && theme == 'warning',
                        'border-l-red-500 after:border-l-red-600':
                            placement == 'left' && theme == 'danger',

                        '-top-2 border-x-8 border-b-8 border-x-transparent after:-top-2.25 after:border-x-8 after:border-b-8 after:border-x-transparent':
                            placement == 'bottom',
                        'border-b-white after:border-b-gray-200':
                            placement == 'bottom' && theme == 'light',
                        'border-b-gray-500 after:border-b-gray-600':
                            placement == 'bottom' && theme == 'secondary',
                        'border-b-amber-300 after:border-b-amber-400':
                            placement == 'bottom' && theme == 'warning',
                        'border-b-red-500 after:border-b-red-600':
                            placement == 'bottom' && theme == 'danger',

                        '-left-2 border-y-8 border-r-8 border-y-transparent after:-left-2.25 after:border-y-8 after:border-r-8 after:border-y-transparent':
                            placement == 'right',
                        'border-r-white after:border-r-gray-200':
                            placement == 'right' && theme == 'light',
                        'border-r-gray-500 after:border-r-gray-600':
                            placement == 'right' && theme == 'secondary',
                        'border-r-amber-300 after:border-r-amber-400':
                            placement == 'right' && theme == 'warning',
                        'border-r-red-500 after:border-r-red-600':
                            placement == 'right' && theme == 'danger',
                    }"
                ></div>
            </div>
        </Teleport>
    </div>
</template>
