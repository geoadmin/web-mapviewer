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

import variables from '@/scss/variables.module.scss'
import { useMovableElement } from '@/utils/composables/useMovableElement.composable'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'
import promptUserToPrintHtmlContent from '@/utils/print'

const footerHeight = parseInt(variables.footerHeight)
const devDisclaimerHeight = parseInt(variables.devDisclaimerHeight)

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
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const currentHeaderHeight = computed(() => store.state.ui.headerHeight)
const isPhoneMode = computed(() => store.getters.isPhoneMode)

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
    if (hasDevSiteWarning.value) {
        top += devDisclaimerHeight
    }
    return {
        top,
        bottom: isPhoneMode.value ? 0 : footerHeight,
        left: 0,
        right: 0,
    }
})

useTippyTooltip('.map-popover-header .print-button[data-tippy-content]')

onMounted(() => {
    if (mode.value === MapPopoverMode.FLOATING && popover.value && popoverHeader.value) {
        useMovableElement(popover.value, {
            grabElement: popoverHeader.value,
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
                <slot name="extra-buttons"></slot>
                <button
                    v-if="authorizePrint"
                    class="print-button btn btn-sm btn-light d-flex align-items-center"
                    data-tippy-content="print"
                    @click="printContent"
                >
                    <FontAwesomeIcon icon="print" />
                </button>
                <button
                    class="btn btn-sm btn-light d-flex align-items-center"
                    data-cy="map-popover-close-button"
                    @click="showContent = !showContent"
                >
                    <FontAwesomeIcon
                        icon="caret-down"
                        :rotation="showContent ? 0 : 90"
                        class="animate-everything"
                    />
                </button>
                <button
                    class="btn btn-sm btn-light d-flex align-items-center"
                    data-cy="map-popover-close-button"
                    @click="onClose"
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
    z-index: $zindex-map-popover;
    &.floating {
        top: calc($header-height + $screen-padding-for-ui-elements);
        left: calc(
            100% - $overlay-width - $map-button-diameter - 3 * $screen-padding-for-ui-elements
        );
    }
    &.floating.with-dev-disclaimer {
        top: calc($header-height + $dev-disclaimer-height + $screen-padding-for-ui-elements);
    }
    .card {
        min-width: $overlay-width;
        pointer-events: auto;
    }
    .map-popover-content {
        max-height: 350px;
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
    }
}
</style>
