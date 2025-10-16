import type { SingleCoordinate } from '@swissgeo/coordinates'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { isNumber } from '@swissgeo/numbers'
import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

export interface GeolocationState {
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
}

export enum GeolocationStoreActions {
    SetGeolocationActive = 'setGeolocationActive',
    ToggleGeolocation = 'toggleGeolocation',
    SetGeolocationTracking = 'setGeolocationTracking',
    SetGeolocationDenied = 'setGeolocationDenied',
    SetGeolocationPosition = 'setGeolocationPosition',
    SetGeolocationAccuracy = 'setGeolocationAccuracy',
    SetGeolocationData = 'setGeolocationData',
}

const useGeolocationStore = defineStore('geolocation', {
    state: (): GeolocationState => ({
        active: false,
        denied: false,
        tracking: true,
        position: undefined,
        accuracy: 0,
    }),
    getters: {},
    actions: {
        [GeolocationStoreActions.SetGeolocationActive](
            active: boolean,
            dispatcher: ActionDispatcher
        ) {
            this.active = active
        },

        [GeolocationStoreActions.ToggleGeolocation](dispatcher: ActionDispatcher) {
            this.active = !this.active
        },

        [GeolocationStoreActions.SetGeolocationTracking](
            isTracking: boolean,
            dispatcher: ActionDispatcher
        ) {
            this.tracking = isTracking
        },

        [GeolocationStoreActions.SetGeolocationDenied](
            isDenied: boolean,
            dispatcher: ActionDispatcher
        ) {
            this.denied = isDenied
            if (this.denied) {
                this.active = false
                this.tracking = false
            }
        },

        [GeolocationStoreActions.SetGeolocationPosition](
            position: SingleCoordinate,
            dispatcher: ActionDispatcher
        ) {
            if (Array.isArray(position) && position.length === 2) {
                this.position = position
            } else {
                log.debug({
                    title: 'Geolocation store',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['Invalid geolocation position received', position],
                })
            }
        },

        [GeolocationStoreActions.SetGeolocationAccuracy](
            accuracy: number,
            dispatcher: ActionDispatcher
        ) {
            if (isNumber(accuracy)) {
                this.accuracy = Number(accuracy)
            } else {
                log.error({
                    title: 'Geolocation store',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['Invalid geolocation accuracy received', accuracy],
                })
            }
        },

        [GeolocationStoreActions.SetGeolocationData](
            position: SingleCoordinate,
            accuracy: number,
            dispatcher: ActionDispatcher
        ) {
            this.setGeolocationPosition(position, dispatcher)
            this.setGeolocationAccuracy(accuracy, dispatcher)
        },
    },
})

export default useGeolocationStore
