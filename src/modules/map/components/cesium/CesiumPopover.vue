<template>
    <MapPopover
        ref="popoverAnchor"
        :authorize-print="authorizePrint"
        :title="title"
        :use-content-padding="useContentPadding"
        :left-position="anchorPosition.left"
        :top-position="anchorPosition.top"
        @close="onClose"
    >
        <template #extra-buttons>
            <slot name="extra-buttons" />
        </template>
        <slot />
    </MapPopover>
</template>

<script>
import MapPopover from '@/modules/map/components/MapPopover.vue'
import log from '@/utils/logging'
import { Cartesian3, Cartographic, defined, Ellipsoid, SceneTransforms } from 'cesium'

// Cesium will create an instance of Cartesian3 or Cartographic each time a calculation is made if
// we do not provide one, so here we declare two "buffer" instances that will be used throughout this component
const tempCartesian3 = new Cartesian3()
const tempCartographic = new Cartographic()

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
    emits: ['close'],
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
            this.updateCoordinateHeight()
            this.updatePosition()
        },
    },
    mounted() {
        const viewer = this.getViewer()
        if (viewer) {
            // By default, the `camera.changed` event will trigger when the camera has changed by 50%
            // To make it more sensitive (and improve tooltip "tracking" on the map), we set down sensitivity to 0.1%
            // meaning that a change of 0.1% in any direction/rotation axis of the camera will trigger a change event
            viewer.camera.percentageChanged = 0.001
            viewer.camera.changed.addEventListener(this.updatePosition)

            // if the user zooms in (or out) we want to be sure that the new loaded terrain
            // is taken into account for the tooltip positioning
            viewer.scene.globe.tileLoadProgressEvent.addEventListener(() => {
                // recalculating height and position as soon as all new terrain tiles are loaded (after camera movement, or at init)
                if (viewer.scene.globe.tilesLoaded) {
                    this.updateCoordinateHeight()
                    this.updatePosition()
                }
            })
            // implementing something similar to the sandcastle found on https://github.com/CesiumGS/cesium/issues/3247#issuecomment-1533505387
            // but taking into account height using globe.getHeight for the given coordinate
            // without taking height into account, the anchor for the tooltip will be the virtual bottom of the map (at sea level), rendering poorly as
            // there will be a gap between the tooltip and the selected feature
            this.updateCoordinateHeight()
            this.updatePosition()
        } else {
            log.error('Cesium viewer unavailable, could not hook up popover to Cesium')
        }
    },
    unmounted() {
        const viewer = this.getViewer()
        if (viewer) {
            viewer.camera.changed.removeEventListener(this.updatePosition)
            // Set back the camera change sensitivity to default value (see mounted())
            viewer.camera.percentageChanged = 0.5
        }
    },
    methods: {
        /**
         * Grabs the height on the terrain (no backend request) for the given coordinates, and
         * stores it in this.coordinatesHeight
         */
        updateCoordinateHeight() {
            this.coordinatesHeight = this.getViewer()?.scene.globe.getHeight(
                Cartographic.fromDegrees(
                    this.coordinates[0],
                    this.coordinates[1],
                    0,
                    tempCartographic
                )
            )
        },
        updatePosition() {
            if (!this.coordinates?.length) {
                this.$emit('close')
                return
            }
            const cartesianCoords = SceneTransforms.wgs84ToWindowCoordinates(
                this.getViewer().scene,
                Cartesian3.fromDegrees(
                    this.coordinates[0],
                    this.coordinates[1],
                    this.coordinatesHeight,
                    Ellipsoid.WGS84,
                    tempCartesian3
                )
            )
            if (defined(cartesianCoords) && this.$refs.popoverAnchor) {
                this.anchorPosition.left =
                    cartesianCoords.x - this.$refs.popoverAnchor.$el.clientWidth / 2
                // adding 15px to the top so that the tip of the arrow of the tooltip is on the edge
                // of the highlighting circle of the selected feature
                this.anchorPosition.top = cartesianCoords.y + 15
            }
        },
        onClose() {
            this.$emit('close')
        },
    },
}
</script>
