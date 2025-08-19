import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import { WEBMERCATOR } from '@geoadmin/coordinates'
import proj4 from 'proj4'

import type { ActionDispatcher } from '@/store/types'

import { DEFAULT_PROJECTION } from '@/config/map.config'
import useCesiumStore from '@/store/modules/cesium.store'
import useGeolocationStore from '@/store/modules/geolocation.store'
import usePositionStore from '@/store/modules/position.store'

const dispatcher: ActionDispatcher = { name: '2d-to-3d-management.plugin' }

/**
 * Plugin to switch to WebMercator coordinate system when we go 3D, and swap back to the default
 * projection when 2D is re-activated
 */
export const from2Dto3Dplugin: PiniaPlugin = (context: PiniaPluginContext): void => {
    const cesiumStore = useCesiumStore()
    const geolocationStore = useGeolocationStore()
    const positionStore = usePositionStore()

    context.store.$onAction(({ after, name }) => {
        after(() => {
            if (name === 'set3dActive') {
                if (DEFAULT_PROJECTION.epsg !== WEBMERCATOR.epsg) {
                    if (cesiumStore.active) {
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
        })
    })
}

export default from2Dto3Dplugin
