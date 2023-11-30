import LayerTypes from '@/api/layers/LayerTypes.enum'
import { ClickInfo, ClickType } from '@/store/modules/map.store'
import { computed } from 'vue'
import { useStore } from 'vuex'

const msBeforeTriggeringLocationPopup = 700

export function useMouseOnMap() {
    let isPointerDown = false
    let isStillOnStartingPosition = false
    let hasPointerDownTriggeredLocationPopup = false
    let contextMenuTimeout = null

    const store = useStore()
    const visibleGeoJsonLayers = computed(() =>
        store.getters.visibleLayers.filter((layer) => layer.type === LayerTypes.GEOJSON)
    )
    const visibleKMLLayers = computed(() =>
        store.getters.visibleLayers.filter((layer) => layer.type === LayerTypes.KML)
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
                console.log(
                    'GeoJSON features',
                    geoJSonLayer
                    // booleanIntersects(geoJSonLayer, coordinate)
                )
                // features.push(...this.handleClickOnGeoJsonLayer(event, geoJSonLayer))
            })
            visibleKMLLayers.value.forEach((KMLLayer) => {
                // features.push(...this.handleClickOnKMLLayer(event, KMLLayer))
            })
            store.dispatch(
                'click',
                new ClickInfo(coordinate, screenPosition, features, ClickType.LEFT_SINGLECLICK)
            )
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
    }

    function onRightClick(screenPosition, coordinate) {
        store.dispatch(
            'click',
            new ClickInfo(coordinate, screenPosition, [], ClickType.CONTEXTMENU)
        )
    }

    return {
        onLeftClickDown,
        onLeftClickUp,
        onRightClick,
        onMouseMove,
    }
}
