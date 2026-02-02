import { constants, LV95, WEBMERCATOR } from '@geoadmin/coordinates'
import log from '@geoadmin/log'
import { round } from '@geoadmin/numbers'
import { View } from 'ol'
import { DoubleClickZoom } from 'ol/interaction'
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

import { VIEW_MIN_RESOLUTION } from '@/config/map.config'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'

const dispatcher = { dispatcher: 'map-views.composable' }

let animationDuration = 200
if (IS_TESTING_WITH_CYPRESS) {
    animationDuration = 0
}

export default function useViewBasedOnProjection(map) {
    const store = useStore()
    const center = computed(() => store.state.position.center)
    const projection = computed(() => store.state.position.projection)
    const zoom = computed(() => store.state.position.zoom)
    const rotation = computed(() => store.state.position.rotation)
    const autoRotation = computed(() => store.state.position.autoRotation)

    const viewsForProjection = {}
    viewsForProjection[LV95.epsg] = new View({
        zoom: zoom.value,
        minResolution: VIEW_MIN_RESOLUTION,
        rotation: rotation.value,
        resolutions: constants.LV95_RESOLUTIONS,
        projection: LV95.epsg,
        extent: LV95.bounds.flatten,
        constrainOnlyCenter: true,
        constrainResolution: true,
    })
    viewsForProjection[WEBMERCATOR.epsg] = new View({
        zoom: zoom.value,
        minResolution: VIEW_MIN_RESOLUTION,
        rotation: rotation.value,
        projection: WEBMERCATOR.epsg,
        constrainResolution: true,
    })

    const roundedDoubleClickZoom = new DoubleClickZoom()

    roundedDoubleClickZoom.handleEvent = function (event) {
        if (event.type === 'dblclick') {
            event.preventDefault()
            event.stopPropagation()
            const view = map.getView()
            const zoom = view.getZoom()
            let roundedZoom = store.state.position.projection.roundZoomLevel(zoom, true)
            // Check if the zoom level is already rounded
            if (zoom !== roundedZoom) {
                view.setZoom(roundedZoom)
            }
        }
        // Call the original handleEvent method to allow other interactions to work
        return DoubleClickZoom.prototype.handleEvent.call(this, event)
    }

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

    watch(rotation, (newRotation) =>
        viewsForProjection[projection.value.epsg].animate({
            rotation: newRotation,
            duration: animationDuration,
        })
    )

    onMounted(() => {
        setViewAccordingToProjection()
        map.on('moveend', updateMapPositionInStore)
        map.addInteraction(roundedDoubleClickZoom)
    })

    onBeforeUnmount(() => {
        map.un('moveend', updateMapPositionInStore)
        map.removeInteraction(roundedDoubleClickZoom)
    })

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

    function updateMapPositionInStore() {
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
            if (currentRotation !== rotation.value && !autoRotation.value) {
                // Don't update the rotation in store when autorotation is enabled, this
                // is not needed as auto rotation is managed by the device orientation composable
                store.dispatch('setRotation', { rotation: currentRotation, ...dispatcher })
            }
        }
    }
}
