<template>
    <div>
        <slot />
    </div>
</template>

<script>
import {
    Cartesian3,
    Cartographic,
    defined,
    KeyboardEventModifier,
    SceneTransforms,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
} from 'cesium'

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
            this.updateCoordinateHeight()
            this.updatePosition()
        },
    },
    mounted() {
        const viewer = this.getViewer()
        if (viewer) {
            this.cesiumHandler = new ScreenSpaceEventHandler(viewer.scene.canvas)
            this.cesiumHandler.setInputAction(this.updatePosition, ScreenSpaceEventType.MOUSE_MOVE)
            // wheel event will trigger a zoom, the tooltip will need repositioning
            this.cesiumHandler.setInputAction(this.updatePosition, ScreenSpaceEventType.WHEEL)
            // rotating the view/camera is done by CTRL+click and move, so we also listen to mouse move when CTRL is down
            this.cesiumHandler.setInputAction(
                this.updatePosition,
                ScreenSpaceEventType.MOUSE_MOVE,
                KeyboardEventModifier.CTRL
            )
            viewer.camera.changed.addEventListener(this.updatePosition)

            // implementing something similar to the sandcastle found on https://github.com/CesiumGS/cesium/issues/3247#issuecomment-1533505387
            // but taking into account height using globe.getHeight for the given coordinate
            this.updateCoordinateHeight()
            this.updatePosition()
        }
    },
    unmounted() {
        this.cesiumHandler?.destroy()
    },
    methods: {
        updateCoordinateHeight() {
            this.coordinatesHeight = this.getViewer()?.scene.globe.getHeight(
                Cartographic.fromDegrees(this.coordinates[0], this.coordinates[1])
            )
        },
        updatePosition() {
            if (!this.coordinates?.length) {
                this.onClose()
                return
            }
            const cartesianCoords = SceneTransforms.wgs84ToWindowCoordinates(
                this.getViewer().scene,
                Cartesian3.fromDegrees(
                    this.coordinates[0],
                    this.coordinates[1],
                    this.coordinatesHeight
                )
            )
            if (defined(cartesianCoords)) {
                const mapPopover = this.getMapPopoverRef()
                const { width } = mapPopover.getBoundingClientRect()
                mapPopover.style.left = `${cartesianCoords.x - width / 2}px`
                mapPopover.style.top = `${cartesianCoords.y + 15}px`
            }
        },
    },
}
</script>
