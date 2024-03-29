import { computed } from 'vue'
import { useStore } from 'vuex'

import { ClickInfo, ClickType } from '@/store/modules/map.store'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'mouse-click.composable' }
const msBeforeTriggeringLocationPopup = 700

export function useMouseOnMap() {
    let isPointerDown = false
    let isStillOnStartingPosition = false
    let hasPointerDownTriggeredLocationPopup = false
    let contextMenuTimeout = null

    const store = useStore()
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

    /**
     * Function to be called when a left on the map has occured.
     *
     * Vector features found by the mapping framework (not requiring backend interaction) can be
     * given as param
     *
     * @param {[Number, Number]} screenPosition Position of the click on the screen [x, y] in pixels
     *   (counted from top left corner)
     * @param {[Number, Number]} coordinate Position of the click expressed in the current mapping
     *   projection
     * @param {SelectableFeature[]} features List of vector features found by the mapping framework
     *   at the click position
     */
    function onLeftClickUp(screenPosition, coordinate, features = []) {
        clearTimeout(contextMenuTimeout)
        // if we've already "handled" this click event, we do nothing more
        if (!hasPointerDownTriggeredLocationPopup && isStillOnStartingPosition) {
            store.dispatch('click', {
                clickInfo: new ClickInfo({
                    coordinate,
                    pixelCoordinate: screenPosition,
                    features,
                    clickType: ClickType.LEFT_SINGLECLICK,
                }),
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
            clickInfo: new ClickInfo({
                coordinate,
                pixelCoordinate: screenPosition,
                clickType: ClickType.CONTEXTMENU,
            }),
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
