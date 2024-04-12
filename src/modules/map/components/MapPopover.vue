<template>
    <div class="map-popover pe-none" data-cy="popover" :style="cssPositionOnScreen">
        <!--
        IMPORTANT: the bootstrap pe-none (pointer-event: none) above is mandatory together with the
        <div class="card"></div> below in order to avoid overlap of the popover triangle (generated
        with the css ::before and ::after) with the openlayer move interaction. Without this hack we
        cannot move anymore the drawing component with the floating tooltip.
        -->
        <div class="card">
            <div class="card-header d-flex">
                <span class="flex-grow-1 align-self-center">
                    {{ title }}
                </span>
                <slot name="extra-buttons"></slot>
                <button
                    v-if="authorizePrint"
                    class="btn btn-sm btn-light d-flex align-items-center"
                    @click="printContent"
                >
                    <FontAwesomeIcon icon="print" />
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

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import promptUserToPrintHtmlContent from '@/utils/print'

/** Map popover content and styles. Position handling is done in corresponding library components */
export default {
    components: { FontAwesomeIcon },
    props: {
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
        topPosition: {
            type: Number,
            default: 0,
        },
        leftPosition: {
            type: Number,
            default: 0,
        },
    },
    emits: ['close'],
    computed: {
        cssPositionOnScreen() {
            return {
                top: `${this.topPosition}px`,
                left: `${this.leftPosition}px`,
            }
        },
    },
    methods: {
        onClose() {
            this.$emit('close')
        },
        printContent() {
            promptUserToPrintHtmlContent('mapPopoverContent')
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.map-popover {
    position: absolute;
    z-index: $zindex-map + 1;
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
@media (min-height: 600px) {
    .map-popover .card-body {
        max-height: 510px;
    }
}
</style>
