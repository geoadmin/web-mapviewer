<template>
    <div ref="mapPopover" class="map-popover" data-cy="popover" @contextmenu.stop>
        <div class="card">
            <div class="card-header d-flex">
                <span class="flex-grow-1 align-self-center">
                    {{ title }}
                </span>
                <slot name="extra-buttons"></slot>
                <ButtonWithIcon
                    v-if="authorizePrint"
                    :button-font-awesome-icon="['fa', 'print']"
                    @click="printContent"
                />
                <ButtonWithIcon
                    data-cy="map-popover-close-button"
                    :button-font-awesome-icon="['fa', 'times']"
                    @click="onClose"
                />
            </div>
            <div ref="mapPopoverContent" class="card-body">
                <slot />
            </div>
        </div>
    </div>
</template>

<script>
import Overlay from 'ol/Overlay'
import OverlayPositioning from 'ol/OverlayPositioning'

import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import promptUserToPrintHtmlContent from '@/utils/print'

/**
 * Shows a popover on the map at the given position (coordinates) and with the slot as the content
 * of the popover
 */
export default {
    components: { ButtonWithIcon },
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
    },
    emits: ['close'],
    watch: {
        coordinates(newCoordinates) {
            this.overlay.setPosition(newCoordinates)
            // Reset the container's scroll when the content changes.
            this.$refs.mapPopoverContent.scrollTo(0, 0)
        },
    },
    beforeCreate() {
        this.overlay = new Overlay({
            offset: [0, 15],
            positioning: OverlayPositioning.TOP_CENTER,
            className: 'map-popover-overlay',
        })
    },
    mounted() {
        const olMap = this.getMap()
        if (olMap) {
            this.overlay.setElement(this.$refs.mapPopover)
            olMap.addOverlay(this.overlay)
            this.overlay.setPosition(this.coordinates)
        }
    },
    beforeUnmount() {
        const olMap = this.getMap()
        if (olMap) {
            olMap.removeOverlay(this.overlay)
        }
    },
    methods: {
        onClose() {
            this.$emit('close')
        },
        printContent() {
            promptUserToPrintHtmlContent(this.$refs.mapPopoverContent.outerHTML)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.map-popover {
    .card-body {
        max-width: 400px;
        max-height: 400px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    &::before {
        $arrow-height: 15px;
        position: absolute;
        top: -($arrow-height * 2);
        left: 50%;
        margin-left: -$arrow-height;
        border: $arrow-height solid transparent;
        border-bottom-color: $light;
        pointer-events: none;
        content: '';
    }
}
</style>
