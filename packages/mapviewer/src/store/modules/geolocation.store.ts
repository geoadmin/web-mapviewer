import type { SingleCoordinate } from '@geoadmin/coordinates'

import log, { LogPreDefinedColor } from '@geoadmin/log'
import { isNumber } from '@geoadmin/numbers'
import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types.ts'

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
        setGeolocation(active: boolean, dispatcher: ActionDispatcher) {
            this.active = active
        },

        toggleGeolocation(dispatcher: ActionDispatcher) {
            this.active = !this.active
        },

        setGeolocationTracking(isTracking: boolean, dispatcher: ActionDispatcher) {
            this.tracking = isTracking
        },

        setGeolocationDenied(isDenied: boolean, dispatcher: ActionDispatcher) {
            this.denied = isDenied
            if (this.denied) {
                this.active = false
                this.tracking = false
            }
        },

        setGeolocationPosition(position: SingleCoordinate, dispatcher: ActionDispatcher) {
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

        setGeolocationAccuracy(accuracy: number, dispatcher: ActionDispatcher) {
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

        setGeolocationData(
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
