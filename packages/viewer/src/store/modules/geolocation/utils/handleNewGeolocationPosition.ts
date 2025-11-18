import type { SingleCoordinate } from '@swissgeo/coordinates'

import { WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { round } from '@swissgeo/numbers'
import { isEqual } from 'lodash'
import proj4 from 'proj4'

import type { GeolocationStore } from '@/store/modules/geolocation/types/geolocation'
import type { ActionDispatcher } from '@/store/types'

import setCenterIfInBounds from '@/store/modules/geolocation/utils/setCenterIfInBounds'
import usePositionStore from '@/store/modules/position'

export default function handleNewGeolocationPosition(
    this: GeolocationStore,
    position: GeolocationPosition,
    dispatcher: ActionDispatcher
): void {
    const positionStore = usePositionStore()

    log.debug({
        title: 'Geolocation store / handleNewPosition',
        titleColor: LogPreDefinedColor.Amber,
        messages: [
            `Received position from geolocation`,
            position,
            `error count=${this.errorCount}`,
        ],
    })
    this.errorCount = 0 // reset the error count on each successful position
    const { coords } = position
    const positionProjected: SingleCoordinate = proj4(WGS84.epsg, positionStore.projection.epsg, [
        coords.longitude,
        coords.latitude,
    ])
    // Accuracy in in meter, so we don't need the decimal part and avoid dispatching event
    // if the accuracy did not change more than one metter
    const accuracy = round(position.coords.accuracy, 0)
    if (!isEqual(this.position, positionProjected) || this.accuracy !== accuracy) {
        this.setGeolocationPosition(positionProjected, dispatcher)
        this.setGeolocationAccuracy(accuracy, dispatcher)
    }
    // if tracking is active, we center the view of the map on the position received and change
    // to the proper zoom
    if (this.tracking) {
        setCenterIfInBounds.call(this, positionProjected, dispatcher)
    }
}
