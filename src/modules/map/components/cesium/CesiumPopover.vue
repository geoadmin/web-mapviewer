<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { Cartesian2, Cartesian3, Ellipsoid, SceneTransforms } from 'cesium'

const popup3DCoordScratch = new Cartesian3()
const popup2DCoordScratch = new Cartesian2()

/**
 * Places a popover on the cesium viewer at the given position (coordinates) and with the slot as
 * the content of the popover
 */
export default {
    inject: ['getViewer', 'onClose', 'getMapPopoverRef'],
    props: {
        coordinates: {
            type: Array,
            required: true,
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
                this.onClose()
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
                    const mapPopover = this.getMapPopoverRef()
                    const width = mapPopover.getBoundingClientRect().width
                    mapPopover.style.left = `${pixel.x - width / 2}px`
                    mapPopover.style.top = `${pixel.y + 10}px`
                }
            }
        },
    },
}
</script>
