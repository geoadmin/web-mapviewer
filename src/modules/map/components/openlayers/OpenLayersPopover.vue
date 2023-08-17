<template>
    <MapPopover
        ref="mapPopoverContainer"
        :authorize-print="authorizePrint"
        :title="title"
        :use-content-padding="useContentPadding"
    >
        <template #extra-buttons>
            <slot name="extra-buttons"></slot>
        </template>
        <slot></slot>
    </MapPopover>
</template>

<script>
import Overlay from 'ol/Overlay'
import MapPopover from '@/modules/map/components/MapPopover.vue'

/**
 * Shows a popover on the map at the given position (coordinates) and with the slot as the content
 * of the popover
 */
export default {
    components: { MapPopover },
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
            autoPan: { margin: 0 },
        })
    },
    mounted() {
        this.overlay.setElement(this.$refs.mapPopoverContainer.getMapPopoverRef())
        this.getMap().addOverlay(this.overlay)
        this.overlay.setPosition(this.coordinates)
    },
    beforeUnmount() {
        this.getMap().removeOverlay(this.overlay)
    },
}
</script>
