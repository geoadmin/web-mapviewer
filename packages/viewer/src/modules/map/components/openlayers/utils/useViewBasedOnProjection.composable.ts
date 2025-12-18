import type { Map } from 'ol'
import type MapBrowserEvent from 'ol/MapBrowserEvent'
import type { MaybeRef } from 'vue'

import { constants, LV95, WEBMERCATOR } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import { round } from '@swissgeo/numbers'
import { VIEW_MIN_RESOLUTION } from '@swissgeo/staging-config/constants'
import { View } from 'ol'
import { DoubleClickZoom } from 'ol/interaction'
import { computed, onBeforeUnmount, onMounted, toValue, watch } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import usePositionStore from '@/store/modules/position'

const dispatcher: ActionDispatcher = { name: 'useViewBasedOnProjection' }

let animationDuration = 200
if (IS_TESTING_WITH_CYPRESS) {
    animationDuration = 0
}

export default function useViewBasedOnProjection(map: MaybeRef<Map>): void {
    const positionStore = usePositionStore()
    const center = computed(() => positionStore.center)
    const projection = computed(() => positionStore.projection)
    const zoom = computed(() => positionStore.zoom)
    const rotation = computed(() => positionStore.rotation)
    const autoRotation = computed(() => positionStore.autoRotation)

    const viewsForProjection: Record<string, View> = {}
    viewsForProjection[LV95.epsg] = new View({
        zoom: zoom.value,
        minResolution: VIEW_MIN_RESOLUTION,
        rotation: rotation.value,
        resolutions: constants.LV95_RESOLUTIONS,
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

    const roundedDoubleClickZoom = new DoubleClickZoom()

    roundedDoubleClickZoom.handleEvent = function (event: MapBrowserEvent<PointerEvent>): boolean {
        if (event.type === 'dblclick') {
            event.preventDefault()
            event.stopPropagation()
            const view = toValue(map).getView()
            const zoom = view.getZoom()
            if (zoom !== undefined) {
                const roundedZoom = positionStore.projection.roundZoomLevel(zoom)
                // Check if the zoom level is already rounded
                if (zoom !== roundedZoom) {
                    view.setZoom(roundedZoom)
                }
            }
        }
        // Call the original handleEvent method to allow other interactions to work
        return DoubleClickZoom.prototype.handleEvent.call(this, event)
    }

    watch(projection, setViewAccordingToProjection)

    watch(center, (newCenter) => {
        const view = viewsForProjection[projection.value.epsg]
        if (view) {
            view.animate({
                center: newCenter,
                duration: animationDuration,
            })
        }
    })

    watch(zoom, (newZoom) => {
        const view = viewsForProjection[projection.value.epsg]
        if (view) {
            view.animate({
                zoom: newZoom,
                duration: animationDuration,
            })
        }
    })

    watch(rotation, (newRotation) => {
        const view = viewsForProjection[projection.value.epsg]
        if (view) {
            view.animate({
                rotation: newRotation,
                duration: animationDuration,
            })
        }
    })

    onMounted(() => {
        setViewAccordingToProjection()
        toValue(map).on('moveend', updateMapPositionInStore)
        toValue(map).addInteraction(roundedDoubleClickZoom)
    })

    onBeforeUnmount(() => {
        toValue(map).un('moveend', updateMapPositionInStore)
        toValue(map).removeInteraction(roundedDoubleClickZoom)
    })

    function setViewAccordingToProjection(): void {
        const viewForProjection = viewsForProjection[projection.value.epsg]
        if (viewForProjection) {
            viewForProjection.setCenter(center.value)
            viewForProjection.setZoom(zoom.value)
            toValue(map).setView(viewForProjection)
        } else {
            log.error('View for projection was not found', projection.value)
        }
    }

    function updateMapPositionInStore(): void {
        const currentView = viewsForProjection[projection.value.epsg]
        if (currentView) {
            const centerCoordinates = currentView.getCenter()
            if (centerCoordinates) {
                const [x, y] = centerCoordinates
                if (
                    x !== undefined &&
                    y !== undefined &&
                    (x !== center.value[0] || y !== center.value[1])
                ) {
                    positionStore.setCenter([x, y], dispatcher)
                }
            }
            const currentZoom = currentView.getZoom()
            if (currentZoom !== undefined) {
                const roundedZoom = round(currentZoom, 3)
                if (roundedZoom !== zoom.value) {
                    positionStore.setZoom(roundedZoom, dispatcher)
                }
            }
            const currentRotation = currentView.getRotation()
            if (currentRotation !== rotation.value && !autoRotation.value) {
                // Don't update the rotation in store when autorotation is enabled, this
                // is not needed as auto rotation is managed by the device orientation composable
                positionStore.setRotation(currentRotation, dispatcher)
            }
        }
    }
}
