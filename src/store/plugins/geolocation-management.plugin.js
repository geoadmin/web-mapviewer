import proj4 from 'proj4'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { STANDARD_ZOOM_LEVEL_1_25000_MAP } from '@/utils/coordinates/CoordinateSystem.class'
import { LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class.js'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'geolocation-management.plugin' }

const ENABLE_HIGH_ACCURACY = true

let geolocationWatcher = null
let firstTimeActivatingGeolocation = true
let errorCount = 0

function setCenterIfInBounds(store, center) {
    if (
        store.state.cesium.active
            ? LV95.getBoundsAs(WEBMERCATOR).isInBounds(center[0], center[1])
            : LV95.isInBounds(center[0], center[1])
    ) {
        store.dispatch('setCenter', {
            center: center,
            ...dispatcher,
        })
    } else {
        log.warn('current geolocation is out of bounds')
        store.dispatch('setErrorText', {
            errorText: 'geoloc_out_of_bounds',
            ...dispatcher,
        })
    }
}

const readPosition = (position, projection) => {
    const { coords } = position
    return proj4(WGS84.epsg, projection.epsg, [coords.longitude, coords.latitude])
}

const handlePositionAndDispatchToStore = (position, store) => {
    log.debug(
        `Received position from geolocation`,
        position,
        store.state.geolocation,
        `error count=${errorCount}`
    )
    errorCount = 0 // reset the error count on each successfull position
    const positionProjected = readPosition(position, store.state.position.projection)
    store.dispatch('setGeolocationPosition', {
        position: positionProjected,
        ...dispatcher,
    })
    store.dispatch('setGeolocationAccuracy', {
        accuracy: position.coords.accuracy,
        ...dispatcher,
    })
    // if tracking is active, we center the view of the map on the position received
    if (store.state.geolocation.tracking) {
        setCenterIfInBounds(store, positionProjected)
    }
}

/**
 * Handles Geolocation API errors
 *
 * @param {GeolocationPositionError} error
 * @param {Vuex.Store} store
 * @param {Vuex.State} state
 * @param {Boolean} [options.reactivate=false] Re-activate initial geolocation in case of unknown
 *   failure. Default is `false`
 */
const handlePositionError = (error, store, state, options = {}) => {
    const { reactivate = false } = options
    log.error('Geolocation activation failed', error)
    switch (error.code) {
        case error.PERMISSION_DENIED:
            store.dispatch('setGeolocationDenied', {
                denied: true,
                ...dispatcher,
            })
            store.dispatch('setErrorText', { errorText: 'geoloc_permission_denied', ...dispatcher })
            break
        case error.TIMEOUT:
            store.dispatch('setGeolocation', { active: false, ...dispatcher })
            store.dispatch('setErrorText', { errorText: 'geoloc_time_out', ...dispatcher })
            break
        default:
            if (IS_TESTING_WITH_CYPRESS && error.code === error.POSITION_UNAVAILABLE) {
                // edge case for e2e testing, if we are testing with Cypress and we receive a POSITION_UNAVAILABLE
                // we don't raise an error as it's "normal" in Electron to have this error raised (this API doesn't work
                // on Electron embedded in Cypress : no Geolocation hardware detected, etc...)
                // the position will be returned by a mocked up function by Cypress we can ignore this error
                // we do nothing...
            } else {
                // It can happen that the position is not yet available so we retry the api call silently for the first
                // 3 call
                errorCount += 1
                if (errorCount < 3) {
                    if (reactivate) {
                        activeGeolocation(store, state, { useInitial: false })
                    }
                } else {
                    store.dispatch('setErrorText', { errorText: 'geoloc_unknown', ...dispatcher })
                    if (reactivate) {
                        // If after 3 retries we failed to re-activate, set the geolocation to false
                        // so that the user can manually retry the geolocation later on. This can
                        // mean that the device don't support geolocation so it doesn't make sense
                        // to retry for ever.
                        // In the case where we are in the watcher, this means that we had at least
                        // one successful location and that geolocation is supported by the device.
                        // So we let the watcher continue has he might recover itself later on, if
                        // not the error will kept showing and the user will have to manually stop
                        // geolocation.
                        store.dispatch('setGeolocation', { active: false, ...dispatcher })
                    }
                }
            }
    }
}

const activeGeolocation = (store, state, options = {}) => {
    const { useInitial = true } = options
    if (
        useInitial &&
        store.state.geolocation.position[0] !== 0 &&
        store.state.geolocation.position[1] !== 0
    ) {
        // if we have a previous position use it first to be more reactive but set a
        // bad accuracy as we don't know how exact it is.
        setCenterIfInBounds(store, store.state.geolocation.position)
        store.dispatch('setGeolocationAccuracy', {
            accuracy: 50 * 1000, // 50 km
            ...dispatcher,
        })
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            log.debug(
                `Geolocation API current position`,
                position,
                `firstTimeActivatingGeolocation=${firstTimeActivatingGeolocation}`
            )
            // register a watcher
            geolocationWatcher = navigator.geolocation.watchPosition(
                (position) => handlePositionAndDispatchToStore(position, store),
                (error) => handlePositionError(error, store),
                {
                    enableHighAccuracy: ENABLE_HIGH_ACCURACY,
                }
            )

            // handle current position
            handlePositionAndDispatchToStore(position, store)

            // set zoom level
            let zoomLevel = STANDARD_ZOOM_LEVEL_1_25000_MAP
            if (state.position.projection instanceof CustomCoordinateSystem) {
                zoomLevel = state.position.projection.transformStandardZoomLevelToCustom(zoomLevel)
            }
            store.dispatch('setZoom', {
                zoom: zoomLevel,
                ...dispatcher,
            })
        },
        (error) => handlePositionError(error, store, state, { reactivate: true }),
        {
            enableHighAccuracy: ENABLE_HIGH_ACCURACY,
            maximumAge: 5 * 60 * 1000, // 5 minutes
            timeout: 2 * 60 * 1000, // 2 minutes
        }
    )
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
                errorCount = 0 // reset the error counter when starting the geolocation
                activeGeolocation(store, state)
            } else if (geolocationWatcher) {
                log.debug(`Geolocation clear watcher`)
                navigator.geolocation.clearWatch(geolocationWatcher)
                geolocationWatcher = null
            }
        } else if (
            mutation.type === 'setCenter' &&
            mutation.payload?.dispatcher !== dispatcher.dispatcher
        ) {
            // if we moved the map we disabled the tracking (unless the tracking moved the map)
            store.dispatch('setGeolocationTracking', {
                tracking: false,
                ...dispatcher,
            })
        }
    })
}

export default geolocationManagementPlugin
