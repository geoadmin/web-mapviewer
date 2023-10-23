<template>
    <slot />
</template>
<script>
import { FeatureStyleColor, RED } from '@/utils/featureStyleUtils'
import Overlay from 'ol/Overlay'

export default {
    inject: ['getMap'],
    props: {
        coordinates: {
            type: Array,
            default: null,
        },
        trackingPointColor: {
            type: FeatureStyleColor,
            default: RED,
        },
    },
    watch: {
        coordinates(newCoordinates) {
            if (newCoordinates) {
                this.currentHoverPosOverlay.setPosition(newCoordinates)
                this.addHoverPositionOverlay()
            } else {
                this.currentHoverPosOverlay.setPosition(null)
                this.removeHoverPositionOverlay()
            }
        },
        trackingPointColor(newColor) {
            this.currentHoverPosOverlay.getElement().style.backgroundColor = newColor.fill
        },
    },
    mounted() {
        // Overlay that shows the corresponding position on the OL map when hovering over the profile graph.
        this.currentHoverPosOverlay = new Overlay({
            element: document.createElement('div'),
            positioning: 'center-center',
            stopEvent: false,
        })
        // setting up a CSS class on the element so that we can style it (see below in the <style> section)
        this.currentHoverPosOverlay.getElement().classList.add('profile-circle-current-hover-pos')
        this.currentHoverPosOverlay.getElement().style.backgroundColor =
            this.trackingPointColor.fill
        if (this.coordinates) {
            this.currentHoverPosOverlay.setPosition(this.coordinates)
            this.addHoverPositionOverlay()
        }
    },
    unmounted() {
        this.removeHoverPositionOverlay()
    },
    methods: {
        addHoverPositionOverlay() {
            this.getMap()?.addOverlay(this.currentHoverPosOverlay)
        },
        removeHoverPositionOverlay() {
            this.getMap()?.removeOverlay(this.currentHoverPosOverlay)
        },
    },
}
</script>
