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
import { computed, ref, useSlots, useTemplateRef, type CSSProperties } from 'vue'

const {
    tooltipContent,
    placement: desiredPlacement = 'top',
    disabled = false,
    theme = 'light',
    openTrigger = 'hover',
} = defineProps<{
    tooltipContent?: string
    placement?: 'top' | 'bottom' | 'right' | 'left'
    disabled?: boolean
    theme?: 'light' | 'warning' | 'secondary' | 'danger'
    openTrigger?: 'hover' | 'click' | 'manual'
}>()

const isShown = ref(false)

const tooltipElement = useTemplateRef('tooltipElement')
const floatingElement = useTemplateRef('floatingElement')
const arrowUpRightRef = useTemplateRef('arrowUpRightElement')
const arrowDownLeftRef = useTemplateRef('arrowDownLeftElement')

const slots = useSlots()

const { floatingStyles, middlewareData, placement } = useFloating(tooltipElement, floatingElement, {
    strategy: 'fixed',
    placement: desiredPlacement,
    whileElementsMounted: autoUpdate,
    middleware: [
        shift(), // shift the element to keep it in view
        flip({
            fallbackAxisSideDirection: 'start',
        }), // allow the opposite side if there's not enough space
        offset(10), // offset it to make room for the arrow
        arrow({ element: arrowDownLeftRef }),
        arrow({ element: arrowUpRightRef }),
    ],
})

const style = computed(() => {
    const style: CSSProperties = {
        ...floatingStyles.value,
        // if the content slot is used, we delegate the styling to the user
        // if it's the fallback, then it's a simple tooltip, thus add the padding
        padding: slots.content ? '' : '6px 10px',
    }
    return style
})

const arrowStyle = computed((): CSSProperties => {
    /** The arrow data is either a position in the x or the y axis, depending on the position */
    return {
        left: middlewareData.value.arrow?.x ? `${middlewareData.value.arrow.x}px` : '',
        top: middlewareData.value.arrow?.y ? `${middlewareData.value.arrow.y}px` : '',
    }
})

/** Extract the data-cy value from the tooltip anchor and */
const dataCyValue = computed((): string => {
    if (tooltipElement.value?.children.length) {
        const dataCy = tooltipElement.value?.children[0].getAttribute('data-cy')
        if (dataCy) {
            return `floating-${dataCy}`
        }
    }
    return ''
})

const openTooltip = (): void => {
    isShown.value = true
}

const closeTooltip = (): void => {
    isShown.value = false
}

const onMouseOver = (): void => {
    if (!disabled && openTrigger === 'hover') {
        openTooltip()
    }
}

const onMouseLeave = (): void => {
    if (!disabled && openTrigger === 'hover') {
        closeTooltip()
    }
}

const eventListenerCloser = (event: MouseEvent) => {
    // Don't close when clicked on the tooltip
    if (floatingElement.value && !floatingElement.value.contains(event.target as Node)) {
        closeTooltip()
        document.removeEventListener('click', eventListenerCloser)
    }
}

const onClick = (event: Event): void => {
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
defineExpose({ tooltipElement, openTooltip, closeTooltip })
</script>

<template>
    <div
        data-cy="floating-container"
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
                :style="style"
                class="floating"
                :class="theme"
                ref="floatingElement"
                v-if="!disabled && isShown"
                :data-cy="dataCyValue"
            >
                <!-- the arrow to be displayed on the top or on the left-->
                <div
                    v-if="placement == 'bottom' || placement == 'right'"
                    ref="arrowUpRightElement"
                    :style="arrowStyle"
                    class="arrow"
                    :class="{ arrowUp: placement == 'bottom', arrowLeft: placement == 'right' }"
                ></div>

                <slot
                    name="content"
                    :close="closeTooltip"
                >
                    {{ tooltipContent }}
                </slot>

                <!-- the arrow to be displayed on the bottom or on the right-->
                <div
                    v-if="placement == 'top' || placement == 'left'"
                    ref="arrowDownLeftElement"
                    :style="arrowStyle"
                    class="arrow"
                    :class="{ arrowDown: placement == 'top', arrowRight: placement == 'left' }"
                ></div>
            </div>
        </Teleport>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.floating {
    z-index: 100;
    border: 1px solid rgba(0, 8, 16, 0.288);
    border-radius: 4px;
    line-height: 1.4;
    box-shadow: 0 4px 14px -2px #0008106c;
    font-size: 16px;
    background-color: var(--background-color);
    color: var(--text-color);

    &.light {
        --background-color: #{$white};
        --text-color: #{$black};
    }
    &.warning {
        --background-color: #{$warning};
        --text-color: #{$black};
    }
    &.secondary {
        --background-color: #{$secondary};
        --text-color: #{$white};
    }
    &.danger {
        --background-color: #{$danger};
        --text-color: #{$white};
    }
}

.arrow {
    position: absolute;
    height: 0;
    width: 0;
}

.arrowUp {
    top: -8px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid var(--background-color);
}

.arrowRight {
    right: -8px;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: 8px solid var(--background-color);
}

.arrowLeft {
    left: -8px;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 8px solid var(--background-color);
}

.arrowDown {
    bottom: -8px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid var(--background-color);
}
</style>
