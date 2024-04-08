<template>
    <slot />
</template>
<script>
import { CallbackProperty, Cartesian3, Color, Ellipsoid, Entity, HeightReference } from 'cesium'
import proj4 from 'proj4'
import { mapState } from 'vuex'

import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { FeatureStyleColor, RED } from '@/utils/featureStyleUtils'

export default {
    inject: ['getCesiumViewer'],
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
    computed: {
        ...mapState({
            projection: (state) => state.position.projection,
        }),
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
            this.getCesiumViewer()?.scene.requestRender()
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
        delete this.removeTrackingPoint()
    },
    methods: {
        addTrackingPoint() {
            this.pointAdded = true
            this.getCesiumViewer()?.entities.add(this.trackingPoint)
        },
        removeTrackingPoint() {
            this.pointAdded = false
            this.getCesiumViewer()?.entities.remove(this.trackingPoint)
        },
        updatePosition() {
            const wgs84Position = proj4(this.projection.epsg, WGS84.epsg, this.coordinates)
            Cartesian3.fromDegrees(
                wgs84Position[0],
                wgs84Position[1],
                0,
                Ellipsoid.WGS84,
                this.trackingPointPosition
            )
            this.getCesiumViewer()?.scene.requestRender()
        },
    },
}
</script>
