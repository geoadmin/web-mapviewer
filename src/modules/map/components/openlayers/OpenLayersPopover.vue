<template>
    <MapPopover
        ref="popoverAnchor"
        :authorize-print="authorizePrint"
        :title="title"
        :use-content-padding="useContentPadding"
        :top-position="anchorPosition.top"
        :left-position="anchorPosition.left"
    >
        <template #extra-buttons>
            <slot name="extra-buttons" />
        </template>
        <slot />
    </MapPopover>
</template>

<script>
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
    data() {
        return {
            anchorPosition: {
                top: 0,
                left: 0,
            },
        }
    },
    watch: {
        coordinates() {
            this.getPixelForCoordinateFromMap()
        },
    },
    mounted() {
        this.getPixelForCoordinateFromMap()
        this.getMap().on('postrender', this.getPixelForCoordinateFromMap)
    },
    unmounted() {
        this.getMap().un('postrender', this.getPixelForCoordinateFromMap)
    },
    methods: {
        getPixelForCoordinateFromMap() {
            const computedPixel = this.getMap().getPixelFromCoordinate(this.coordinates)
            // when switching back from Cesium (or any other map framework), there can be a very small
            // period where the map isn't yet able to process a pixel, this if is there to defend against that
            if (computedPixel) {
                const [left, top] = computedPixel
                this.anchorPosition.left = left - this.$refs.popoverAnchor.$el.clientWidth / 2
                // adding 15px to the top so that the tip of the arrow of the tooltip is on the edge
                // of the highlighting circle of the selected feature
                this.anchorPosition.top = top + 15
            }
        },
    },
}
</script>
