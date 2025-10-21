import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'

import type { GeolocationStore } from '@/store/modules/geolocation/types/geolocation'
import type { ActionDispatcher } from '@/store/types'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import useUIStore from '@/store/modules/ui.store'

interface HandleGeolocationErrorOptions {
    /** Re-activate initial geolocation in case of unknown failure. Default is `false` */
    reactivate?: boolean
}

/** Handles Geolocation API errors */
export default function handleGeolocationError(
    this: GeolocationStore,
    error: GeolocationPositionError,
    options: HandleGeolocationErrorOptions,
    dispatcher: ActionDispatcher
): void {
    const { reactivate = false } = options
    log.error({
        title: 'Geolocation API',
        titleColor: LogPreDefinedColor.Amber,
        messages: ['Geolocation activation failed', error],
    })

    const uiStore = useUIStore()
    switch (error.code) {
        case GeolocationPositionError.PERMISSION_DENIED:
            this.setGeolocationDenied(true, dispatcher)
            uiStore.addErrors([new ErrorMessage('geoloc_permission_denied')], dispatcher)
            break
        case GeolocationPositionError.TIMEOUT:
            this.setGeolocationActive(false, dispatcher)
            uiStore.addErrors([new ErrorMessage('geoloc_time_out')], dispatcher)
            break
        default:
            // It can happen that the position is not yet available so we retry the api call silently for the first
            // 3 call
            this.errorCount += IS_TESTING_WITH_CYPRESS ? 3 : 1
            if (this.errorCount < 3) {
                if (reactivate) {
                    this.setGeolocationActive(true, { usePreviousPosition: false }, dispatcher)
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
                    this.setGeolocationActive(false, { usePreviousPosition: true }, dispatcher)
                }
            }
    }
}
