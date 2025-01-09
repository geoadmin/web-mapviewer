import { isEqual } from 'lodash'
import proj4 from 'proj4'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import { LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import ErrorMessage from '@/utils/ErrorMessage.class'
import log from '@/utils/logging'
import { round } from '@/utils/numberUtils'
const { GeolocationPositionError } = window

const dispatcher = { dispatcher: 'geolocation-management.plugin' }

const ENABLE_HIGH_ACCURACY = true

let geolocationWatcher = null
let firstTimeActivatingGeolocation = true
let errorCount = 0

function setCenterIfInBounds(store, center) {
    if (LV95.getBoundsAs(store.state.position.projection).isInBounds(center[0], center[1])) {
        if (!isEqual(store.state.position.center, center)) {
            store.dispatch('setCenter', {
                center: center,
                ...dispatcher,
            })

            if (firstTimeActivatingGeolocation) {
                firstTimeActivatingGeolocation = !firstTimeActivatingGeolocation
                store.dispatch('setZoom', {
                    zoom: store.state.position.projection.get1_25000ZoomLevel(),
                    ...dispatcher,
                })
            }
        }
    } else {
        log.warn(`current geolocation is out of bounds: ${JSON.stringify(center)}`)
        store.dispatch('addErrors', {
            errors: [new ErrorMessage('geoloc_out_of_bounds', null)],
            ...dispatcher,
        })
    }
}

const readPosition = (position, projection) => {
    const { coords } = position
    return proj4(WGS84.epsg, projection.epsg, [coords.longitude, coords.latitude])
}

const centerMapOnPosition = (positionProjected, store) => {
    setCenterIfInBounds(store, positionProjected)
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
    // Accuracy in in meter, so we don't need the decimal part and avoid dispatching event
    // if the accuracy did not change more than one metter
    const accuracy = round(position.coords.accuracy, 0)
    if (
        !isEqual(store.state.geolocation.position, positionProjected) ||
        store.state.geolocation.accuracy !== accuracy
    ) {
        store.dispatch('setGeolocationData', {
            position: positionProjected,
            accuracy: accuracy,
            ...dispatcher,
        })
    }
    // if tracking is active, we center the view of the map on the position received and change
    // to the proper zoom
    if (store.state.geolocation.tracking) {
        centerMapOnPosition(positionProjected, store)
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
        case GeolocationPositionError.PERMISSION_DENIED:
            store.dispatch('setGeolocationDenied', {
                denied: true,
                ...dispatcher,
            })
            store.dispatch('addErrors', {
                errors: [new ErrorMessage('geoloc_permission_denied')],
                ...dispatcher,
            })
            break
        case GeolocationPositionError.TIMEOUT:
            store.dispatch('setGeolocation', { active: false, ...dispatcher })
            store.dispatch('addErrors', {
                errors: [new ErrorMessage('geoloc_time_out')],
                ...dispatcher,
            })
            break
        default:
            // It can happen that the position is not yet available so we retry the api call silently for the first
            // 3 call
            errorCount += IS_TESTING_WITH_CYPRESS ? 3 : 1
            if (errorCount < 3) {
                if (reactivate) {
                    activeGeolocation(store, state, { useInitial: false })
                }
            } else {
                store.dispatch('addErrors', {
                    errors: [new ErrorMessage('geoloc_unknown')],
                    ...dispatcher,
                })
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

const activeGeolocation = (store, state, options = {}) => {
    const { useInitial = true } = options
    if (useInitial && state.geolocation.position !== null) {
        // if we have a previous position use it first to be more reactive but set a
        // bad accuracy as we don't know how exact it is.
        if (state.geolocation.tracking) {
            // only center if tracking (e.g. in 3D mode we don't center)
            setCenterIfInBounds(store, store.state.geolocation.position)
        }
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
            mutation.payload?.dispatcher !== dispatcher.dispatcher &&
            store.state.geolocation.tracking
        ) {
            // if we moved the map we disabled the tracking (unless the tracking moved the map)
            store.dispatch('setGeolocationTracking', {
                tracking: false,
                ...dispatcher,
            })
            store.dispatch('setAutoRotation', { autoRotation: false, ...dispatcher })
        } else if (
            mutation.type === 'setGeolocationTracking' &&
            mutation.payload?.tracking === true &&
            mutation.payload?.dispatcher !== dispatcher.dispatcher
        ) {
            // If tracking has been re-enabled by clicking on the geolocation button we re-center
            // the map.
            if (store.state.geolocation.position !== null) {
                centerMapOnPosition(store.state.geolocation.position, store)
            }
        }
    })
}

export default geolocationManagementPlugin
