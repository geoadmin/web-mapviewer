import log, { LogPreDefinedColor } from '@swissgeo/log'
import { isNumber } from '@swissgeo/numbers'

import type { GeolocationStore } from '@/store/modules/geolocation/types/geolocation'
import type { ActionDispatcher } from '@/store/types'

export default function setGeolocationAccuracy(
    this: GeolocationStore,
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
}
