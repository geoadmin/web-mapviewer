import { computed } from 'vue'
import { useStore } from 'vuex'

import LayerTypes from '@/api/layers/LayerTypes.enum'
import { ClickInfo, ClickType } from '@/store/modules/map.store'
import {
    identifyGeoJSONFeatureAt,
    identifyGPXFeatureAt,
    identifyKMLFeatureAt,
} from '@/utils/identifyOnVectorLayer'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'mouse-click.composable' }
const msBeforeTriggeringLocationPopup = 700

export function useMouseOnMap() {
    let isPointerDown = false
    let isStillOnStartingPosition = false
    let hasPointerDownTriggeredLocationPopup = false
    let contextMenuTimeout = null

    const store = useStore()
    const isCurrentlyDrawing = computed(() => store.state.ui.showDrawingOverlay)
    const currentKmlDrawingLayer = computed(() => store.getters.activeKmlLayer)
    const visibleGeoJsonLayers = computed(() =>
        store.getters.visibleLayers.filter((layer) => layer.type === LayerTypes.GEOJSON)
    )
    const visibleKMLLayers = computed(() =>
        store.getters.visibleLayers
            .filter((layer) => layer.type === LayerTypes.KML)
            .filter(
                (kmlLayer) =>
                    // No identification of feature on the active KML layer used in the drawing module
                    // as this module already does identification of drawn feature itself.
                    !isCurrentlyDrawing.value || kmlLayer.id !== currentKmlDrawingLayer.value?.id
            )
    )
    const visibleGPXLayers = computed(() =>
        store.getters.visibleLayers.filter((layer) => layer.type === LayerTypes.GPX)
    )
    const currentMapResolution = computed(() => store.getters.resolution)
    const currentProjection = computed(() => store.state.position.projection)
    const isCurrentlyTrackingGeoLocation = computed(
        () => store.state.geolocation.active && store.state.geolocation.tracking
    )

    /**
     * @param {[Number, Number]} screenPosition
     * @param {[Number, Number]} coordinate
     */
    function onLeftClickDown(screenPosition, coordinate) {
        isPointerDown = true
        isStillOnStartingPosition = true
        // if the user stays with a mouse left (or touch) down for a certain amount of time, we want
        // to show the LocationPopup instead of running an identification of features
        contextMenuTimeout = setTimeout(() => {
            if (isStillOnStartingPosition) {
                onRightClick(screenPosition, coordinate)
                hasPointerDownTriggeredLocationPopup = true
                log.debug('Long touch at the same spot detected, showing the location popup')
            }
        }, msBeforeTriggeringLocationPopup)
    }

    function onLeftClickUp(screenPosition, coordinate) {
        clearTimeout(contextMenuTimeout)
        // if we've already "handled" this click event, we do nothing more
        if (!hasPointerDownTriggeredLocationPopup && isStillOnStartingPosition) {
            const features = []
            // if there is a GeoJSON layer currently visible, we will find it and search for features under the mouse cursor
            visibleGeoJsonLayers.value.forEach((geoJSonLayer) => {
                features.push(
                    ...identifyGeoJSONFeatureAt(
                        geoJSonLayer,
                        coordinate,
                        currentProjection.value,
                        currentMapResolution.value
                    )
                )
            })
            // same for KML layers
            visibleKMLLayers.value.forEach((kmlLayer) => {
                features.push(
                    ...identifyKMLFeatureAt(
                        kmlLayer,
                        coordinate,
                        currentProjection.value,
                        currentMapResolution.value
                    )
                )
            })
            // and lastly for GPX layers
            visibleGPXLayers.value.forEach((gpxLayer) => {
                features.push(
                    ...identifyGPXFeatureAt(
                        gpxLayer,
                        coordinate,
                        currentProjection.value,
                        currentMapResolution.value
                    )
                )
            })
            store.dispatch('click', {
                clickInfo: new ClickInfo(
                    coordinate,
                    screenPosition,
                    features,
                    ClickType.LEFT_SINGLECLICK
                ),
                ...dispatcher,
            })
        }
        // reset of all flags
        isPointerDown = false
        isStillOnStartingPosition = false
        hasPointerDownTriggeredLocationPopup = false
    }

    function onMouseMove() {
        if (isPointerDown) {
            isStillOnStartingPosition = false
        }
        if (isCurrentlyTrackingGeoLocation.value) {
            // stop tracking the user geolocation to the center of the view as soon as the map is dragged
            store.dispatch('setGeolocationTracking', {
                tracking: false,
                ...dispatcher,
            })
        }
    }

    function onRightClick(screenPosition, coordinate) {
        store.dispatch('click', {
            clickInfo: new ClickInfo(coordinate, screenPosition, [], ClickType.CONTEXTMENU),
            ...dispatcher,
        })
    }

    return {
        onLeftClickDown,
        onLeftClickUp,
        onRightClick,
        onMouseMove,
    }
}
