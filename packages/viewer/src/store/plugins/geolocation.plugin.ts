import type { SingleCoordinate } from '@swissgeo/coordinates'
import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import { LV95, WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'
import { round } from '@swissgeo/numbers'
import { Math as CesiumMath } from 'cesium'
import { isEqual } from 'lodash'
import proj4 from 'proj4'

import type { ActionDispatcher } from '@/store/types'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import useCesiumStore from '@/store/modules/cesium.store'
import useGeolocationStore, { GeolocationStoreActions } from '@/store/modules/geolocation.store'
import usePositionStore, { PositionStoreActions } from '@/store/modules/position.store'
import useUIStore from '@/store/modules/ui.store'
import { isEnumValue } from '@/utils/utils'

const { GeolocationPositionError } = window

const dispatcher: ActionDispatcher = { name: 'geolocation-management.plugin' }

const ENABLE_HIGH_ACCURACY: boolean = true

let geolocationWatcherId: number | undefined = undefined
let firstTimeActivatingGeolocation: boolean = true
let errorCount: number = 0

function setCenterIfInBounds(center: SingleCoordinate): void {
    const cesiumStore = useCesiumStore()
    const positionStore = usePositionStore()
    const uiStore = useUIStore()

    const lv95BoundsInCurrentProjection = LV95.getBoundsAs(positionStore.projection)

    if (lv95BoundsInCurrentProjection?.isInBounds(center[0], center[1])) {
        if (!isEqual(positionStore.center, center)) {
            positionStore.setCenter(center, dispatcher)

            if (firstTimeActivatingGeolocation) {
                firstTimeActivatingGeolocation = !firstTimeActivatingGeolocation
                if (cesiumStore.active && positionStore.camera) {
                    positionStore.setCameraPosition(
                        {
                            x: positionStore.camera.x,
                            y: positionStore.camera.y,
                            z: positionStore.camera.z,

                            heading: -CesiumMath.toRadians(positionStore.rotation),
                            pitch: -90,
                            roll: 0,
                        },
                        dispatcher
                    )
                }
                positionStore.setZoom(positionStore.projection.get1_25000ZoomLevel(), dispatcher)
            }
        }
    } else {
        log.warn({
            title: 'Geolocation API',
            titleColor: LogPreDefinedColor.Amber,
            messages: [`current geolocation is out of bounds: ${JSON.stringify(center)}`],
        })
        uiStore.addErrors([new ErrorMessage('geoloc_out_of_bounds')], dispatcher)
    }
}

function handlePositionAndDispatchToStore(position: GeolocationPosition): void {
    const geolocationStore = useGeolocationStore()
    const positionStore = usePositionStore()

    log.debug({
        title: 'Geolocation API',
        titleColor: LogPreDefinedColor.Amber,
        messages: [
            `Received position from geolocation`,
            position,
            geolocationStore,
            `error count=${errorCount}`,
        ],
    })
    errorCount = 0 // reset the error count on each successful position
    const { coords } = position
    const positionProjected: SingleCoordinate = proj4(WGS84.epsg, positionStore.projection.epsg, [
        coords.longitude,
        coords.latitude,
    ])
    // Accuracy in in meter, so we don't need the decimal part and avoid dispatching event
    // if the accuracy did not change more than one metter
    const accuracy = round(position.coords.accuracy, 0)
    if (
        !isEqual(geolocationStore.position, positionProjected) ||
        geolocationStore.accuracy !== accuracy
    ) {
        geolocationStore.setGeolocationData(positionProjected, accuracy, dispatcher)
    }
    // if tracking is active, we center the view of the map on the position received and change
    // to the proper zoom
    if (geolocationStore.tracking) {
        setCenterIfInBounds(positionProjected)
    }
}

interface HandleGeolocationErrorOptions {
    /** Re-activate initial geolocation in case of unknown failure. Default is `false` */
    reactivate?: boolean
}

/** Handles Geolocation API errors */
const handlePositionError = (
    error: GeolocationPositionError,
    options?: HandleGeolocationErrorOptions
): void => {
    const { reactivate = false } = options ?? {}
    log.error({
        title: 'Geolocation API',
        titleColor: LogPreDefinedColor.Amber,
        messages: ['Geolocation activation failed', error],
    })

    const geolocationStore = useGeolocationStore()
    const uiStore = useUIStore()
    switch (error.code) {
        case GeolocationPositionError.PERMISSION_DENIED:
            geolocationStore.setGeolocationDenied(true, dispatcher)
            uiStore.addErrors([new ErrorMessage('geoloc_permission_denied')], dispatcher)
            break
        case GeolocationPositionError.TIMEOUT:
            geolocationStore.setGeolocationActive(false, dispatcher)
            uiStore.addErrors([new ErrorMessage('geoloc_time_out')], dispatcher)
            break
        default:
            // It can happen that the position is not yet available so we retry the api call silently for the first
            // 3 call
            errorCount += IS_TESTING_WITH_CYPRESS ? 3 : 1
            if (errorCount < 3) {
                if (reactivate) {
                    activateGeolocation({ usePreviousPosition: false })
                }
            } else {
                uiStore.addErrors([new ErrorMessage('geoloc_unknown')], dispatcher)
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
                    geolocationStore.setGeolocationActive(false, dispatcher)
                }
            }
    }
}

interface GeolocationActivationOptions {
    /**
     * Tells if the previous position should be used to be more reactive but with bad accuracy.
     * Default is `true`.
     */
    usePreviousPosition?: boolean
}

const activateGeolocation = (options?: GeolocationActivationOptions) => {
    const { usePreviousPosition = true } = options ?? {}

    const geolocationStore = useGeolocationStore()

    if (usePreviousPosition && geolocationStore.position) {
        // if we have a previous position, use it first to be more reactive but set
        // bad accuracy as we don't know how exact it is.
        if (geolocationStore.tracking) {
            // only center if tracking (e.g., in 3D mode we don't center)
            setCenterIfInBounds(geolocationStore.position)
        }
        geolocationStore.setGeolocationAccuracy(
            // 50 km
            50 * 1000,
            dispatcher
        )
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            log.debug({
                title: 'Geolocation API',
                titleColor: LogPreDefinedColor.Amber,
                messages: [
                    `Geolocation API current position`,
                    position,
                    `firstTimeActivatingGeolocation=${firstTimeActivatingGeolocation}`,
                ],
            })
            // register a watcher
            geolocationWatcherId = navigator.geolocation.watchPosition(
                (position) => handlePositionAndDispatchToStore(position),
                (error) => handlePositionError(error),
                {
                    enableHighAccuracy: ENABLE_HIGH_ACCURACY,
                }
            )

            // handle current position
            handlePositionAndDispatchToStore(position)
        },
        (error) => handlePositionError(error, { reactivate: true }),
        {
            enableHighAccuracy: ENABLE_HIGH_ACCURACY,
            maximumAge: 5 * 60 * 1000, // 5 minutes
            timeout: 2 * 60 * 1000, // 2 minutes
        }
    )
}

/**
 * Plugin that handles the HTML5 Geolocation API interaction, and dispatch its output to the store
 * when geolocation is active.
 */
const geolocationManagementPlugin: PiniaPlugin = (context: PiniaPluginContext): void => {
    const { store } = context

    store.$onAction(({ name, args }) => {
        const geolocationStore = useGeolocationStore()
        const positionStore = usePositionStore()

        // listening to the start/stop of geolocation
        if (
            isEnumValue<GeolocationStoreActions>(GeolocationStoreActions.SetGeolocationActive, name)
        ) {
            if (geolocationStore.active) {
                errorCount = 0 // reset the error counter when starting the geolocation
                activateGeolocation()
            } else if (geolocationWatcherId) {
                log.debug(`Geolocation clear watcher`)
                navigator.geolocation.clearWatch(geolocationWatcherId)
                geolocationWatcherId = undefined
            }
        } else if (
            isEnumValue<GeolocationStoreActions>(
                GeolocationStoreActions.SetGeolocationTracking,
                name
            )
        ) {
            const [isTracking, actionDispatcher] = args as Parameters<
                typeof geolocationStore.setGeolocationTracking
            >
            // If tracking has been re-enabled by clicking on the geolocation button we re-center the map.
            if (
                isTracking &&
                actionDispatcher.name !== dispatcher.name &&
                geolocationStore.position
            ) {
                setCenterIfInBounds(geolocationStore.position)
            }
        } else if (isEnumValue<PositionStoreActions>(PositionStoreActions.SetCenter, name)) {
            // if we moved the map we disabled the tracking (unless the tracking moved the map)
            geolocationStore.setGeolocationTracking(false, dispatcher)
            positionStore.setAutoRotation(false, dispatcher)
        }
    })
}

export default geolocationManagementPlugin
