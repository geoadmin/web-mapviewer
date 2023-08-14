<template>
    <slot />
</template>
<script>
import { LV95, WGS84 } from '@/utils/coordinateSystems'
import { FeatureStyleColor, RED } from '@/utils/featureStyleUtils'
import proj4 from 'proj4'
import { CallbackProperty, Cartesian3, Color, Ellipsoid, Entity, HeightReference } from 'cesium'

export default {
    inject: ['getViewer'],
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
                this.updatePosition()
                if (!this.pointAdded) this.addTrackingPoint()
            } else {
                this.removeTrackingPoint()
            }
        },
        trackingPointColor(newColor) {
            this.pointFill = Color.fromCssColorString(newColor.fill)
            this.pointBorder = Color.fromCssColorString(newColor.border)
            this.getViewer()?.scene.requestRender()
        },
    },
    mounted() {
        this.pointAdded = false
        this.trackingPointPosition = new Cartesian3()
        this.pointFill = Color.fromCssColorString(this.trackingPointColor.fill)
        this.pointBorder = Color.fromCssColorString(this.trackingPointColor.border)
        this.trackingPoint = new Entity({
            position: new CallbackProperty(() => this.trackingPointPosition, false),
            point: {
                show: true,
                color: new CallbackProperty(() => this.pointFill, false),
                outlineWidth: 5,
                outlineColor: new CallbackProperty(() => this.pointBorder, false),
                pixelSize: 15,
                heightReference: HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        })
        if (this.coordinates) {
            this.updatePosition()
            this.addTrackingPoint()
        }
    },
    unmounted() {
        this.removeTrackingPoint()
    },
    methods: {
        addTrackingPoint() {
            this.pointAdded = true
            this.getViewer()?.entities.add(this.trackingPoint)
        },
        removeTrackingPoint() {
            this.pointAdded = false
            this.getViewer()?.entities.remove(this.trackingPoint)
        },
        updatePosition() {
            const wgs84Position = proj4(LV95.epsg, WGS84.epsg, this.coordinates)
            Cartesian3.fromDegrees(
                wgs84Position[0],
                wgs84Position[1],
                0,
                Ellipsoid.WGS84,
                this.trackingPointPosition
            )
            this.getViewer()?.scene.requestRender()
        },
    },
}
</script>
