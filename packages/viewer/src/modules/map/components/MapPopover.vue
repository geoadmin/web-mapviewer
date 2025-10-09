<script setup lang="ts">
/** Map popover content and styles. Position handling is done in corresponding library components */

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, onMounted, ref, useTemplateRef } from 'vue'

import {
    cssDevDisclaimerHeight,
    cssDrawingMobileToolbarHeight,
    cssFooterHeight,
    cssHeaderHeight,
    cssTimeSliderBarHeight,
    cssTimeSliderDropdownHeight,
} from '@/scss/exports'
import PrintButton from '@/utils/components/PrintButton.vue'
import { useMovableElement } from '@/utils/composables/useMovableElement.composable'
import useUIStore from '@/store/modules/ui.store'
import useDrawingStore from '@/store/modules/drawing.store'
import { MapPopoverMode } from '@/modules/map/components/MapPopoverMode.enum'

interface AnchorPosition {
    top: number
    left: number
}

const {
    authorizePrint,
    title,
    useContentPadding,
    anchorPosition,
    mode = MapPopoverMode.FLOATING,
} = defineProps<{
    authorizePrint: boolean
    title: string
    useContentPadding: boolean
    anchorPosition?: AnchorPosition
    mode?: MapPopoverMode
}>()
const emits = defineEmits(['close'])

const popoverHeader = useTemplateRef<HTMLDivElement>('popoverHeader')
const popover = useTemplateRef<HTMLDivElement>('popover')
const mapPopoverContent = useTemplateRef<HTMLDivElement>('mapPopoverContent')

const width = computed(() => popover.value?.clientWidth)

const showContent = ref(true)

const uiStore = useUIStore()
const drawingStore = useDrawingStore()

const isCurrentlyDrawing = computed(() => drawingStore.drawingOverlay.show)
const hasDevSiteWarning = computed(() => uiStore.hasDevSiteWarning)
const isTimeSliderActive = computed(() => uiStore.isTimeSliderActive)
const currentHeaderHeight = computed(() => uiStore.headerHeight)
const isPhoneMode = computed(() => uiStore.isPhoneMode)
const isDesktopMode = computed(() => uiStore.isTraditionalDesktopSize)

const cssPositionOnScreen = computed(() => {
    if (mode === MapPopoverMode.FEATURE_TOOLTIP && anchorPosition) {
        return {
            top: `${anchorPosition.top}px`,
            left: `${anchorPosition.left}px`,
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

onMounted(() => {
    if (mode === MapPopoverMode.FLOATING && popover.value && popoverHeader.value) {
        useMovableElement({
            element: popover.value,
            grabElement: popoverHeader.value,
            offset: popoverLimits.value,
        })
    }
})

function onClose() {
    emits('close')
}

defineExpose({
    width,
})
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
            <div
                ref="popoverHeader"
                class="map-popover-header card-header d-flex"
            >
                <span class="align-self-center flex-grow-1">
                    {{ title }}
                </span>
                <PrintButton
                    v-if="authorizePrint && showContent"
                    :content="mapPopoverContent"
                />
                <slot name="extra-buttons" />
                <button
                    class="btn btn-sm btn-light d-flex align-items-center"
                    data-cy="map-popover-close-button"
                    @click="showContent = !showContent"
                    @mousedown.stop=""
                >
                    <FontAwesomeIcon :icon="`caret-${showContent ? 'up' : 'down'}`" />
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
/* stylelint-disable scss/operator-no-newline-after */
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
