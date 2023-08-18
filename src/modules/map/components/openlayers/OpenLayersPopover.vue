<template>
    <div>
        <slot />
    </div>
</template>

<script>
import Overlay from 'ol/Overlay'

/**
 * Shows a popover on the map at the given position (coordinates) and with the slot as the content
 * of the popover
 */
export default {
    inject: ['getMap', 'getMapPopoverRef'],
    props: {
        coordinates: {
            type: Array,
            required: true,
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
        this.overlay.setElement(this.getMapPopoverRef())
        this.getMap().addOverlay(this.overlay)
        this.overlay.setPosition(this.coordinates)
    },
    beforeUnmount() {
        this.getMap().removeOverlay(this.overlay)
    },
}
</script>
