import { View } from 'ol'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { IS_TESTING_WITH_CYPRESS, VIEW_MIN_RESOLUTION } from '@/config'
import { LV95, WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import { LV95_RESOLUTIONS } from '@/utils/coordinates/SwissCoordinateSystem.class'
import log from '@/utils/logging'
import { round } from '@/utils/numberUtils'

const dispatcher = { dispatcher: 'map-views.composable' }

let animationDuration = 200
if (IS_TESTING_WITH_CYPRESS) {
    animationDuration = 0
}

export default function useViewBasedOnProjection(map) {
    const northwardRotation = ref(0)

    const store = useStore()
    const center = computed(() => store.state.position.center)
    const projection = computed(() => store.state.position.projection)
    const zoom = computed(() => store.state.position.zoom)
    const rotation = computed(() => store.state.position.rotation)
    const autoRotation = computed(() => store.state.position.autoRotation)
    const resetRotation = computed(() => store.state.position.resetRotation)

    const viewsForProjection = {}
    viewsForProjection[LV95.epsg] = new View({
        zoom: zoom.value,
        minResolution: VIEW_MIN_RESOLUTION,
        rotation: rotation.value,
        resolutions: LV95_RESOLUTIONS,
        projection: LV95.epsg,
        extent: LV95.bounds.flatten,
        constrainOnlyCenter: true,
    })
    viewsForProjection[WEBMERCATOR.epsg] = new View({
        zoom: zoom.value,
        minResolution: VIEW_MIN_RESOLUTION,
        rotation: rotation.value,
        projection: WEBMERCATOR.epsg,
    })

    watch(projection, setViewAccordingToProjection)
    watch(center, (newCenter) =>
        viewsForProjection[projection.value.epsg].animate({
            center: newCenter,
            duration: animationDuration,
        })
    )
    watch(zoom, (newZoom) =>
        viewsForProjection[projection.value.epsg].animate({
            zoom: newZoom,
            duration: animationDuration,
        })
    )
    watch(rotation, (newRotation) => {
        if (!autoRotation.value) {
            viewsForProjection[projection.value.epsg].animate({
                rotation: newRotation,
                duration: animationDuration,
            })
        }
    })
    watch(northwardRotation, (newRotation) => {
        viewsForProjection[projection.value.epsg].animate({
            rotation: newRotation,
            duration: animationDuration,
        })
    })
    watch(autoRotation, () => {
        rotate()
    })
    watch(resetRotation, () => {
        viewsForProjection[projection.value.epsg].animate({
            rotation: 0,
            duration: animationDuration,
        })
        store.dispatch('setResetRotation', false)
    })

    onMounted(() => {
        setViewAccordingToProjection()
        map.on('moveend', updateCenterInStore)
    })
    onBeforeUnmount(() => {
        map.un('moveend', updateCenterInStore)
    })

    const handleOrientation = function (event) {
        northwardRotation.value = round((event.alpha / 180) * Math.PI, 2)
        console.error('New device rotation value received', northwardRotation.value)
    }

    function rotate() {
        if (autoRotation.value) {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission().then(() => {
                    window.addEventListener('deviceorientation', handleOrientation)
                })
            } else {
                window.addEventListener('deviceorientation', handleOrientation)
            }
        } else {
            if (!store.state.position.resetRotation) {
                store.dispatch('setRotation', northwardRotation.value)
            }
            window.removeEventListener('deviceorientation', handleOrientation)
        }
    }

    function setViewAccordingToProjection() {
        const viewForProjection = viewsForProjection[projection.value.epsg]
        if (viewForProjection) {
            viewForProjection.setCenter(center.value)
            viewForProjection.setZoom(zoom.value)
            map.setView(viewForProjection)
        } else {
            log.error('View for projection was not found', projection.value)
        }
    }
    function updateCenterInStore() {
        const currentView = viewsForProjection[projection.value.epsg]
        if (currentView) {
            const [x, y] = currentView.getCenter()
            if (x !== center.value[0] || y !== center.value[1]) {
                store.dispatch('setCenter', { center: { x, y }, ...dispatcher })
            }
            const currentZoom = round(currentView.getZoom(), 3)
            if (currentZoom && currentZoom !== zoom.value) {
                store.dispatch('setZoom', { zoom: currentZoom, ...dispatcher })
            }
            const currentRotation = currentView.getRotation()
            if (currentRotation !== rotation.value) {
                store.dispatch('setRotation', currentRotation)
            }
        }
    }
}
