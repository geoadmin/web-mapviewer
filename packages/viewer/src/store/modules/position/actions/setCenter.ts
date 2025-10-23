import type { SingleCoordinate } from '@swissgeo/coordinates'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { PositionStore } from '@/store/modules/position/types/position'
import type { ActionDispatcher } from '@/store/types'

import useGeolocationStore from '@/store/modules/geolocation'

export default function setCenter(
    this: PositionStore,
    center: SingleCoordinate,
    dispatcher: ActionDispatcher
): void {
    if (!center || (Array.isArray(center) && center.length !== 2)) {
        log.error({
            title: 'Position store / setCenter',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Invalid center, ignoring', center, dispatcher],
        })
        return
    }
    if (!this.projection.isInBounds(center[0], center[1])) {
        this.center = center
    } else {
        log.warn({
            title: 'Position store / setCenter',
            titleColor: LogPreDefinedColor.Red,
            messages: [
                'Center received is out of projection bounds, ignoring',
                this.projection,
                this.center,
                dispatcher,
            ],
        })
    }

    const geolocationStore = useGeolocationStore()

    // TODO: fix this, it stops the tracking when receiving the first geolocation position update
    if (geolocationStore.tracking && geolocationStore.position !== center) {
        // if we moved the map we disabled the geolocation tracking (unless the tracking moved the map)
        geolocationStore.setGeolocationTracking(false, dispatcher)
        this.setAutoRotation(false, dispatcher)
    }
}
