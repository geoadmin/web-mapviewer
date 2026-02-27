import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { GeolocationStore } from '@/store/modules/geolocation/types'
import type { ActionDispatcher } from '@/store/types'

import handleGeolocationError from '@/store/modules/geolocation/utils/handleGeolocationError'
import handleNewGeolocationPosition from '@/store/modules/geolocation/utils/handleNewGeolocationPosition'
import setCenterIfInBounds from '@/store/modules/geolocation/utils/setCenterIfInBounds'

interface GeolocationActivationOptions {
    /**
     * Tells if the previous position should be used to be more reactive but with bad accuracy.
     * Default is `true`.
     */
    usePreviousPosition?: boolean
}

let geolocationWatcherId: number | undefined

export default function setGeolocationActive(
    this: GeolocationStore,
    active: boolean,
    options: GeolocationActivationOptions,
    dispatcher: ActionDispatcher
): void
export default function setGeolocationActive(
    this: GeolocationStore,
    active: boolean,
    dispatcher: ActionDispatcher
): void

export default function setGeolocationActive(
    this: GeolocationStore,
    active: boolean,
    optionsOrDispatcher: GeolocationActivationOptions | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
): void {
    this.active = active

    const dispatcher = dispatcherOrNothing ?? (optionsOrDispatcher as ActionDispatcher)
    const options = dispatcherOrNothing ? (optionsOrDispatcher as GeolocationActivationOptions) : {}

    if (this.active) {
        this.errorCount = 0 // reset the error counter when starting the geolocation

        const { usePreviousPosition = true } = options

        if (usePreviousPosition && this.position) {
            // if we have a previous position, use it first to be more reactive but set
            // bad accuracy as we don't know how exact it is.
            if (this.tracking) {
                // only center if tracking (e.g., in 3D mode we don't center)
                setCenterIfInBounds.call(this, this.position, dispatcher)
            }
            this.setGeolocationAccuracy(
                // 50 km
                50 * 1000,
                dispatcher
            )
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                log.debug({
                    title: 'Geolocation store / setGeolocationActive',
                    titleColor: LogPreDefinedColor.Amber,
                    messages: [
                        `Geolocation API current position`,
                        position,
                        `firstTimeActivatingGeolocation=${this.firstTime}`,
                    ],
                })
                // register a watcher
                geolocationWatcherId = navigator.geolocation.watchPosition(
                    (position) => handleNewGeolocationPosition.call(this, position, dispatcher),
                    (error) =>
                        handleGeolocationError.call(this, error, { reactivate: false }, dispatcher),
                    {
                        enableHighAccuracy: true,
                    }
                )

                // handle current position
                handleNewGeolocationPosition.call(this, position, dispatcher)
            },
            (error) => handleGeolocationError.call(this, error, { reactivate: true }, dispatcher),
            {
                enableHighAccuracy: true,
                maximumAge: 5 * 60 * 1000, // 5 minutes
                timeout: 2 * 60 * 1000, // 2 minutes
            }
        )
    } else if (geolocationWatcherId) {
        log.debug({
            title: 'Geolocation store / setGeolocationActive',
            titleColor: LogPreDefinedColor.Amber,
            messages: [`Clearing geolocation watcher`],
        })
        navigator.geolocation.clearWatch(geolocationWatcherId)
        geolocationWatcherId = undefined
    }
}
