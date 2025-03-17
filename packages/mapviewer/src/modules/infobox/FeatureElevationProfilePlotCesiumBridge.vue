<script setup>
import { coordinates as geoadminCoordinates } from '@geoadmin/coordinates'
import { CallbackProperty, Cartesian3, Color, Ellipsoid, Entity, HeightReference } from 'cesium'
import proj4 from 'proj4'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { FeatureStyleColor, RED } from '@/utils/featureStyleUtils'

const { coordinates, trackingPointColor } = defineProps({
    coordinates: {
        type: Array,
        default: null,
    },
    trackingPointColor: {
        type: FeatureStyleColor,
        default: RED,
    },
})

const getViewer = inject('getViewer')

const trackingPointPosition = new Cartesian3()

const pointAdded = ref(false)
const pointFill = ref(null)
const pointBorder = ref(null)
let trackingPoint = null

const store = useStore()

const projection = computed(() => store.state.position.projection)

onMounted(() => {
    pointAdded.value = false
    pointFill.value = Color.fromCssColorString(trackingPointColor.fill)
    pointBorder.value = Color.fromCssColorString(trackingPointColor.border)
    trackingPoint = new Entity({
        position: new CallbackProperty(() => trackingPointPosition, false),
        point: {
            show: true,
            color: new CallbackProperty(() => pointFill.value, false),
            outlineWidth: 5,
            outlineColor: new CallbackProperty(() => pointBorder.value, false),
            pixelSize: 15,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
    })
    if (coordinates) {
        updatePosition()
        addTrackingPoint()
    }
})

onBeforeUnmount(() => {
    removeTrackingPoint()
})

watch(
    () => coordinates,
    (newCoordinates) => {
        if (newCoordinates) {
            updatePosition()
            if (!pointAdded.value) {
                addTrackingPoint()
            }
        } else {
            removeTrackingPoint()
        }
    }
)
watch(
    () => trackingPointColor,
    (newColor) => {
        pointFill.value = Color.fromCssColorString(newColor.fill)
        pointBorder.value = Color.fromCssColorString(newColor.border)
        getViewer()?.scene.requestRender()
    }
)

function addTrackingPoint() {
    pointAdded.value = true
    getViewer()?.entities.add(trackingPoint)
}

function removeTrackingPoint() {
    pointAdded.value = false
    getViewer()?.entities.remove(trackingPoint)
}

function updatePosition() {
    const wgs84Position = proj4(projection.value.epsg, geoadminCoordinates.WGS84.epsg, coordinates)
    Cartesian3.fromDegrees(
        wgs84Position[0],
        wgs84Position[1],
        0,
        Ellipsoid.WGS84,
        trackingPointPosition
    )
    getViewer()?.scene.requestRender()
}
</script>

<template>
    <slot />
</template>
