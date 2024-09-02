import proj4 from 'proj4'

import { DEFAULT_PROJECTION } from '@/config/map.config'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'

const dispatcher = { dispatcher: '2d-to-3d-management.plugin' }

/**
 * Plugin to switch to WebMercator coordinate system when we go 3D, and swap back to the default
 * projection when 2D is re-activated
 *
 * @param {Vuex.Store} store
 */
export default function from2Dto3Dplugin(store) {
    store.subscribeAction({
        after: (action, state) => {
            if (action.type === 'set3dActive') {
                if (DEFAULT_PROJECTION.epsg !== WEBMERCATOR.epsg) {
                    if (state.cesium.active) {
                        // We also need to re-project the geolocation position
                        if (state.geolocation.position) {
                            const geolocationPosition = proj4(
                                state.position.projection.epsg,
                                WEBMERCATOR.epsg,
                                state.geolocation.position
                            )
                            store.dispatch('setGeolocationPosition', {
                                position: geolocationPosition,
                                ...dispatcher,
                            })
                        }
                        store.dispatch('setProjection', {
                            projection: WEBMERCATOR,
                            ...dispatcher,
                        })
                    } else {
                        // We also need to re-project the geolocation position
                        if (state.geolocation.position) {
                            const geolocationPosition = proj4(
                                state.position.projection.epsg,
                                DEFAULT_PROJECTION.epsg,
                                state.geolocation.position
                            )
                            store.dispatch('setGeolocationPosition', {
                                position: geolocationPosition,
                                ...dispatcher,
                            })
                        }
                        store.dispatch('setProjection', {
                            projection: DEFAULT_PROJECTION,
                            ...dispatcher,
                        })
                    }
                }
            }
        },
    })
}
