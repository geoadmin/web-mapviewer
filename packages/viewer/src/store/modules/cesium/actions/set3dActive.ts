import { WEBMERCATOR } from '@swissgeo/coordinates'
import proj4 from 'proj4'

import type { CesiumStore } from '@/store/modules/cesium/types/cesium'
import type { ActionDispatcher } from '@/store/types'

import { DEFAULT_PROJECTION } from '@/config/map.config'
import useGeolocationStore from '@/store/modules/geolocation'
import usePositionStore from '@/store/modules/position'

export default function set3dActive(
    this: CesiumStore,
    active: boolean,
    dispatcher: ActionDispatcher
) {
    this.active = active

    const geolocationStore = useGeolocationStore()
    const positionStore = usePositionStore()

    if (DEFAULT_PROJECTION.epsg !== WEBMERCATOR.epsg) {
        if (this.active) {
            // We also need to re-project the geolocation position
            if (geolocationStore.position) {
                const geolocationPosition = proj4(
                    positionStore.projection.epsg,
                    WEBMERCATOR.epsg,
                    geolocationStore.position
                )
                geolocationStore.setGeolocationPosition(geolocationPosition, dispatcher)
            }
            positionStore.setProjection(WEBMERCATOR, dispatcher)
        } else {
            // We also need to re-project the geolocation position
            if (geolocationStore.position) {
                const geolocationPosition = proj4(
                    positionStore.projection.epsg,
                    DEFAULT_PROJECTION.epsg,
                    geolocationStore.position
                )
                geolocationStore.setGeolocationPosition(geolocationPosition, dispatcher)
            }
            positionStore.setProjection(DEFAULT_PROJECTION, dispatcher)
        }
    }
}
