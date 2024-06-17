<script>
/** @enum */
export const MapPopoverMode = {
    FLOATING: 'FLOATING',
    FEATURE_TOOLTIP: 'FEATURE_TOOLTIP',
}
</script>
<script setup>
/** Map popover content and styles. Position handling is done in corresponding library components */

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, onMounted, ref, toRefs } from 'vue'
import { useStore } from 'vuex'

import {
    cssDevDisclaimerHeight,
    cssDrawingMobileToolbarHeight,
    cssFooterHeight,
    cssHeaderHeight,
    cssTimeSliderBarHeight,
    cssTimeSliderDropdownHeight,
} from '@/scss/exports'
import { useMovableElement } from '@/utils/composables/useMovableElement.composable'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'
import promptUserToPrintHtmlContent from '@/utils/print'

const props = defineProps({
    authorizePrint: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: '',
    },
    useContentPadding: {
        type: Boolean,
        default: false,
    },
    anchorPosition: {
        type: Object,
        default: null,
        validator: (value, props) =>
            props.mode !== MapPopoverMode.FEATURE_TOOLTIP ||
            (value && value.top >= 0 && value.left >= 0),
    },
    mode: {
        type: String,
        default: MapPopoverMode.FLOATING,
        validator: (value) => Object.values(MapPopoverMode).includes(value),
    },
})

const { authorizePrint, title, useContentPadding, anchorPosition, mode } = toRefs(props)

const emits = defineEmits(['close'])

const popoverHeader = ref(null)
const popover = ref(null)

const showContent = ref(true)

const store = useStore()
// as the drawing toolbox takes the space of the header on mobile, we have to keep track of its state so that we
// can adapt the limits for the floating tooltip.
const isCurrentlyDrawing = computed(() => store.state.drawing.drawingOverlay.show)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const isTimeSliderActive = computed(() => store.state.ui.isTimeSliderActive)
const currentHeaderHeight = computed(() => store.state.ui.headerHeight)
const isPhoneMode = computed(() => store.getters.isPhoneMode)
const isDesktopMode = computed(() => store.getters.isTraditionalDesktopSize)

const cssPositionOnScreen = computed(() => {
    if (mode.value === MapPopoverMode.FEATURE_TOOLTIP) {
        return {
            top: `${anchorPosition.value.top}px`,
            left: `${anchorPosition.value.left}px`,
        }
    }
    return {}
})

const popoverLimits = computed(() => {
    let top = currentHeaderHeight.value
    if (isCurrentlyDrawing.value) {
        if (isPhoneMode.value) {
            top = cssDrawingMobileToolbarHeight
        } else {
            // drawing header ("Draw & Measure" gray bar) height
            top = cssHeaderHeight
        }
    } else if (hasDevSiteWarning.value) {
        top += cssDevDisclaimerHeight
    }
    if (isTimeSliderActive.value) {
        top += isDesktopMode.value ? cssTimeSliderBarHeight : cssTimeSliderDropdownHeight
    }
    return {
        top,
        bottom: isPhoneMode.value ? 0 : cssFooterHeight,
        left: 0,
        right: 0,
    }
})

useTippyTooltip('.map-popover-header [data-tippy-content]')

onMounted(() => {
    if (mode.value === MapPopoverMode.FLOATING && popover.value && popoverHeader.value) {
        useMovableElement(popover.value, {
            grabElement: popoverHeader,
            offset: popoverLimits,
        })
    }
})

function onClose() {
    emits('close')
}
function printContent() {
    promptUserToPrintHtmlContent('mapPopoverContent')
}
</script>

<template>
    <div
        ref="popover"
        class="map-popover pe-none"
        data-cy="popover"
        :style="cssPositionOnScreen"
        :class="{
            floating: mode === MapPopoverMode.FLOATING,
            'feature-anchored': mode === MapPopoverMode.FEATURE_TOOLTIP,
            'with-dev-disclaimer': hasDevSiteWarning,
            'with-time-slider-bar': isTimeSliderActive && isDesktopMode,
            'with-dev-disclaimer-and-time-slider-bar':
                hasDevSiteWarning && isTimeSliderActive && isDesktopMode,
            'with-time-slider-dropdown': isTimeSliderActive && !isDesktopMode,
            'with-dev-disclaimer-and-time-slider-dropdown':
                hasDevSiteWarning && isTimeSliderActive && !isDesktopMode,
            'phone-mode': isPhoneMode,
            'is-drawing': isCurrentlyDrawing,
        }"
    >
        <!--
        IMPORTANT: the bootstrap pe-none (pointer-event: none) above is mandatory together with the
        <div class="card"></div> below in order to avoid overlap of the popover triangle (generated
        with the css ::before and ::after) with the openlayer move interaction. Without this hack we
        cannot move anymore the drawing component with the floating tooltip.
        -->
        <div class="card">
            <div ref="popoverHeader" class="map-popover-header card-header d-flex">
                <span class="flex-grow-1 align-self-center">
                    {{ title }}
                </span>
                <button
                    v-if="authorizePrint"
                    class="print-button btn btn-sm btn-light d-flex align-items-center"
                    data-tippy-content="print"
                    @click="printContent"
                    @mousedown.stop=""
                >
                    <FontAwesomeIcon icon="print" />
                </button>
                <slot name="extra-buttons"></slot>
                <button
                    class="btn btn-sm btn-light d-flex align-items-center"
                    data-cy="map-popover-close-button"
                    @click="showContent = !showContent"
                    @mousedown.stop=""
                >
                    <FontAwesomeIcon :icon="`caret-${showContent ? 'down' : 'right'}`" />
                </button>
                <button
                    class="btn btn-sm btn-light d-flex align-items-center"
                    data-cy="map-popover-close-button"
                    @click="onClose"
                    @mousedown.stop=""
                >
                    <FontAwesomeIcon icon="times" />
                </button>
            </div>
            <div
                v-if="showContent"
                id="mapPopoverContent"
                ref="mapPopoverContent"
                class="map-popover-content"
                :class="{ 'card-body': useContentPadding }"
            >
                <slot />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
@import '@/scss/media-query.mixin';

.map-popover {
    position: absolute;
    min-width: $overlay-width;
    max-width: $overlay-width;
    z-index: $zindex-map-popover;
    &.floating {
        top: calc($header-height + $screen-padding-for-ui-elements);
        left: calc(
            100% - $overlay-width - $map-button-diameter - 3 * $screen-padding-for-ui-elements
        );
        &.with-dev-disclaimer {
            top: calc($header-height + $dev-disclaimer-height + $screen-padding-for-ui-elements);
        }
        &.with-time-slider-bar {
            top: calc($header-height + $time-slider-bar-height + $screen-padding-for-ui-elements);
        }
        &.with-time-slider-dropdown {
            top: calc(
                $header-height + $time-slider-dropdown-height + $screen-padding-for-ui-elements
            );
        }
        &.with-dev-disclaimer-and-time-slider-bar {
            top: calc(
                $header-height + $time-slider-bar-height + $dev-disclaimer-height +
                    $screen-padding-for-ui-elements
            );
        }
        &.with-dev-disclaimer-and-time-slider-dropdown {
            top: calc(
                $header-height + $time-slider-dropdown-height + $dev-disclaimer-height +
                    $screen-padding-for-ui-elements
            );
        }
        &.phone-mode.is-drawing {
            top: calc($drawing-tools-height-mobile + $screen-padding-for-ui-elements);
        }
        &.is-drawing {
            top: calc($header-height + $screen-padding-for-ui-elements);
        }
    }
    .card {
        pointer-events: auto;
    }
    .map-popover-content {
        max-height: min(60vh, 350px);
        overflow-y: auto;
    }
    .card-body {
        display: flex;
        flex-direction: column;
    }
    &.feature-anchored {
        // Triangle border
        $arrow-height: 12px;
        &::before {
            position: absolute;
            top: -($arrow-height * 2);
            left: 50%;
            margin-left: -$arrow-height;
            border: $arrow-height solid transparent;
            border-bottom-color: $border-color-translucent;
            content: '';
        }
        // Triangle background
        &::after {
            $arrow-border-height: $arrow-height - 1;
            content: '';
            border: $arrow-border-height solid transparent;
            border-bottom-color: $light;
            position: absolute;
            top: -($arrow-border-height * 2);
            left: 50%;
            margin-left: -$arrow-border-height;
        }
    }
}
@media (min-height: 600px) {
    .map-popover .card-body {
        max-height: 510px;
    }
}

@include respond-above(lg) {
    .map-popover {
        &.floating {
            top: calc(2 * $header-height + $screen-padding-for-ui-elements);
        }
        &.floating.with-dev-disclaimer {
            top: calc(
                2 * $header-height + $dev-disclaimer-height + $screen-padding-for-ui-elements
            );
        }
        &.floating.with-time-slider-bar {
            top: calc(
                2 * $header-height + $time-slider-bar-height + $screen-padding-for-ui-elements
            );
        }
        &.floating.with-time-slider-dropdown {
            top: calc(
                2 * $header-height + $time-slider-dropdown-height + $screen-padding-for-ui-elements
            );
        }
        &.floating.with-dev-disclaimer-and-time-slider-bar {
            top: calc(
                2 * $header-height + $time-slider-bar-height + $dev-disclaimer-height +
                    $screen-padding-for-ui-elements
            );
        }
        &.floating.with-dev-disclaimer-and-time-slider-dropdown {
            top: calc(
                2 * $header-height + $time-slider-dropdown-height + $dev-disclaimer-height +
                    $screen-padding-for-ui-elements
            );
        }
    }
}
</style>
