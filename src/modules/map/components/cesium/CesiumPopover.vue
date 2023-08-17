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
import { Cartesian2, Cartesian3, Ellipsoid, SceneTransforms } from 'cesium'
import MapPopover from '@/modules/map/components/MapPopover.vue'

const popup3DCoordScratch = new Cartesian3()
const popup2DCoordScratch = new Cartesian2()

/**
 * Places a popover on the cesium viewer at the given position (coordinates) and with the slot as
 * the content of the popover
 */
export default {
    components: { MapPopover },
    inject: ['getViewer'],
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
        coordinates() {
            this.updatePosition()
        },
    },
    mounted() {
        this.updatePosition()
        const viewer = this.getViewer()
        if (viewer) {
            viewer.camera.changed.addEventListener(this.updatePosition)
            // By default, the `camera.changed` event will trigger when the camera has changed by 50%
            // To make it more sensitive, we set down sensitivity
            viewer.camera.percentageChanged = 0.001
        }
    },
    unmounted() {
        const viewer = this.getViewer()
        if (viewer) {
            viewer.camera.changed.removeEventListener(this.updatePosition)
            // Set default value
            viewer.camera.percentageChanged = 0.5
        }
    },
    methods: {
        updatePosition() {
            if (!this.coordinates?.length) {
                this.$refs.mapPopoverContainer.onClose()
                return
            }
            const cartesianCoords = Cartesian3.fromDegrees(
                this.coordinates[0],
                this.coordinates[1],
                0,
                Ellipsoid.WGS84,
                popup3DCoordScratch
            )
            if (cartesianCoords) {
                // Cesium has an issue with coordinates conversion.
                // The popup placed is not exactly correct when zooming close to the terrain
                // https://github.com/CesiumGS/cesium/issues/3247
                const pixel = SceneTransforms.wgs84ToWindowCoordinates(
                    this.getViewer().scene,
                    cartesianCoords,
                    popup2DCoordScratch
                )
                if (pixel) {
                    const mapPopover = this.$refs.mapPopoverContainer.getMapPopoverRef()
                    const width = mapPopover.getBoundingClientRect().width
                    mapPopover.style.left = `${pixel.x - width / 2}px`
                    mapPopover.style.top = `${pixel.y + 10}px`
                }
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.map-popover {
    position: absolute;
    z-index: 1;
}
</style>
