import proj4 from 'proj4'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import i18n from '@/modules/i18n'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class.js'
import { STANDARD_ZOOM_LEVEL_1_25000_MAP } from '@/utils/coordinates/SwissCoordinateSystem.class.js'
import log from '@/utils/logging'

const STORE_DISPATCHER_GEOLOCATION_PLUGIN = 'geolocation-management.plugin'

let geolocationWatcher = null
let firstTimeActivatingGeolocation = true

const readPosition = (position, projection) => {
    const { coords } = position
    return proj4(WGS84.epsg, projection.epsg, [coords.longitude, coords.latitude])
}

const handlePositionAndDispatchToStore = (position, store) => {
    const positionProjected = readPosition(position, store.state.position.projection)
    store.dispatch('setGeolocationPosition', positionProjected)
    store.dispatch('setGeolocationAccuracy', position.coords.accuracy)
    // if tracking is active, we center the view of the map on the position received
    if (store.state.geolocation.tracking) {
        store.dispatch('setCenter', {
            center: positionProjected,
            dispatcher: STORE_DISPATCHER_GEOLOCATION_PLUGIN,
        })
    }
}

/**
 * Handles Geolocation API errors
 *
 * @param {GeolocationPositionError} error
 * @param {Vuex.Store} store
 */
const handlePositionError = (error, store) => {
    log.error('Geolocation activation failed', error)
    switch (error.code) {
        case error.PERMISSION_DENIED:
            store.dispatch('setGeolocationDenied', true)
            alert(i18n.global.t('geoloc_permission_denied'))
            break
        default:
            if (IS_TESTING_WITH_CYPRESS && error.code === error.POSITION_UNAVAILABLE) {
                // edge case for e2e testing, if we are testing with Cypress and we receive a POSITION_UNAVAILABLE
                // we don't raise an alert as it's "normal" in Electron to have this error raised (this API doesn't work
                // on Electron embedded in Cypress : no Geolocation hardware detected, etc...)
                // the position will be returned by a mocked up function by Cypress we can ignore this error
                // we do nothing...
            } else {
                alert(i18n.global.t('geoloc_unknown'))
            }
    }
}

/**
 * Plugin that handle the HTML5 Geolocation API interaction, and dispatch its output to the store
 * when geolocation is active.
 *
 * @param {Vuex.Store} store
 */
const geolocationManagementPlugin = (store) => {
    store.subscribe((mutation, state) => {
        // listening to the start/stop of geolocation
        if (mutation.type === 'setGeolocationActive') {
            if (state.geolocation.active) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // if geoloc was previously denied, we clear the flag
                        if (state.geolocation.denied) {
                            store.dispatch('setGeolocationDenied', false)
                        }
                        handlePositionAndDispatchToStore(position, store)
                        if (firstTimeActivatingGeolocation) {
                            firstTimeActivatingGeolocation = false
                            let zoomLevel = STANDARD_ZOOM_LEVEL_1_25000_MAP
                            if (state.position.projection instanceof CustomCoordinateSystem) {
                                zoomLevel =
                                    state.position.projection.transformStandardZoomLevelToCustom(
                                        zoomLevel
                                    )
                            }
                            store.dispatch('setZoom', {
                                zoom: zoomLevel,
                                dispatcher: STORE_DISPATCHER_GEOLOCATION_PLUGIN,
                            })
                        }
                        geolocationWatcher = navigator.geolocation.watchPosition(
                            (position) => handlePositionAndDispatchToStore(position, store),
                            (error) => handlePositionError(error, store)
                        )
                    },
                    (error) => handlePositionError(error, store)
                )
            } else if (geolocationWatcher) {
                navigator.geolocation.clearWatch(geolocationWatcher)
                geolocationWatcher = null
            }
        }
    })
}

export default geolocationManagementPlugin
