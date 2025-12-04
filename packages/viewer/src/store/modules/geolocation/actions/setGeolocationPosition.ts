import type { SingleCoordinate } from '@swissgeo/coordinates'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { GeolocationStore } from '@/store/modules/geolocation/types'
import type { ActionDispatcher } from '@/store/types'

import usePositionStore from '@/store/modules/position'

export default function setGeolocationPosition(
    this: GeolocationStore,
    position: SingleCoordinate,
    dispatcher: ActionDispatcher
) {
    if (Array.isArray(position) && position.length === 2) {
        this.position = position

        const positionStore = usePositionStore()
        positionStore.setCenter(position, dispatcher)
    } else {
        log.debug({
            title: 'Geolocation store / setGeolocationPosition',
            titleStyle: {
                backgroundColor: LogPreDefinedColor.Red,
            },
            messages: ['Invalid geolocation position received', position],
        })
    }
}
