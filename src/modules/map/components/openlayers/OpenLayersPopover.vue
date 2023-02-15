<template>
    <div ref="mapPopover" class="map-popover" data-cy="popover" @contextmenu.stop>
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
import promptUserToPrintHtmlContent from '@/utils/print'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Overlay from 'ol/Overlay'

/**
 * Shows a popover on the map at the given position (coordinates) and with the slot as the content
 * of the popover
 */
export default {
    components: { FontAwesomeIcon },
    inject: ['getMap'],
    props: {
        coordinates: {
            type: Array,
            required: true,
        },
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
    },
    emits: ['close'],
    watch: {
        coordinates(newCoordinates) {
            this.overlay.setPosition(newCoordinates)
        },
    },
    beforeCreate() {
        this.overlay = new Overlay({
            // NOTE: the 12 offset is due to the arrow size $arrow-height in css and must always
            // equal this variable in order to have the arrow point to the center of the selected
            // element.
            offset: [0, 12],
            positioning: 'top-center',
            className: 'map-popover-overlay',
            autoPan: { margin: 0 },
        })
    },
    mounted() {
        this.overlay.setElement(this.$refs.mapPopover)
        this.getMap().addOverlay(this.overlay)
        this.overlay.setPosition(this.coordinates)
    },
    beforeUnmount() {
        this.getMap().removeOverlay(this.overlay)
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
    pointer-events: none;
    .card {
        max-width: $overlay-width;
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
