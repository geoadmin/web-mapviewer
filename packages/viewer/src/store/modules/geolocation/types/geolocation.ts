import type { SingleCoordinate } from '@swissgeo/coordinates'

export interface GeolocationStoreState {
    /** Flag telling if the user has activated the geolocation feature */
    active: boolean
    /** Flag telling if the user has denied the geolocation usage in his/her browser settings */
    denied: boolean
    /** Flag telling if the geolocation position should always be at the center of the app */
    tracking: boolean
    /** Device position in the current application projection [x, y] */
    position: SingleCoordinate | undefined
    /** Accuracy of the geolocation position, in meters */
    accuracy: number
    /** Keeps track of the amount of error that happened during the geolocation activation process */
    errorCount: number
    /**
     * Flag telling if this is the first time the geolocation is activated. This is useful when
     * deciding to center the view on the geolocation position at activation.
     */
    firstTime: boolean
}

export type GeolocationStoreGetters = object

export type GeolocationStoreStateAndGetters = GeolocationStoreState & GeolocationStoreGetters

export type GeolocationStore = ReturnType<typeof import('../index.ts').default>
