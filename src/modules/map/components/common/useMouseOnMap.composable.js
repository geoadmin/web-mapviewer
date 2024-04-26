import { computed } from 'vue'
import { useStore } from 'vuex'

import { ClickType } from '@/store/modules/map.store'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'useMouseOnMap.composable' }
const msBeforeTriggeringLocationPopup = 700

let isPointerDown = false
let isStillOnStartingPosition = false
let hasPointerDownTriggeredLocationPopup = false
let contextMenuTimeout = null

export function useMouseOnMap() {
    const store = useStore()
    const isCurrentlyTrackingGeoLocation = computed(
        () => store.state.geolocation.active && store.state.geolocation.tracking
    )

    /**
     * @param {[Number, Number]} [screenPixel=[]] Position of the last click on the screen [x, y] in
     *   pixels (counted from top left corner OF THE SCREEN). Default is `[]`
     * @param {[Number, Number]} [mapPixel=[]] Position of the last click on the map [x, y] in
     *   pixels (counted from top left corner OF THE MAP). Default is `[]`
     * @param {[Number, Number]} coordinate Position of the click expressed in the current mapping
     *   projection
     */
    function onLeftClickDown(screenPixel, mapPixel, coordinate) {
        isPointerDown = true
        isStillOnStartingPosition = true
        // if the user stays with a mouse left (or touch) down for a certain amount of time, we want
        // to show the LocationPopup instead of running an identification of features
        contextMenuTimeout = setTimeout(() => {
            if (isStillOnStartingPosition && isPointerDown) {
                onRightClick(screenPixel, mapPixel, coordinate)
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
     * @param {[Number, Number]} [screenPixel=[]] Position of the last click on the screen [x, y] in
     *   pixels (counted from top left corner OF THE SCREEN). Default is `[]`
     * @param {[Number, Number]} [mapPixel=[]] Position of the last click on the map [x, y] in
     *   pixels (counted from top left corner OF THE MAP). Default is `[]`
     * @param {[Number, Number]} coordinate Position of the click expressed in the current mapping
     *   projection
     * @param {SelectableFeature[]} features List of vector features found by the mapping framework
     *   at the click position
     */
    function onLeftClickUp(screenPixel, mapPixel, coordinate, features = []) {
        isPointerDown = false
        clearTimeout(contextMenuTimeout)
        // if we've already "handled" this click event, we do nothing more
        if (!hasPointerDownTriggeredLocationPopup && isStillOnStartingPosition) {
            store.dispatch('click', {
                clickInfo: {
                    coordinate,
                    screenPixel,
                    mapPixel,
                    features,
                    clickType: ClickType.LEFT_SINGLECLICK,
                },
                ...dispatcher,
            })
        }
        // reset of all flags
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

    function onRightClick(screenPixel, mapPixel, coordinate) {
        store.dispatch('click', {
            clickInfo: {
                coordinate,
                screenPixel,
                mapPixel,
                clickType: ClickType.CONTEXTMENU,
            },
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
