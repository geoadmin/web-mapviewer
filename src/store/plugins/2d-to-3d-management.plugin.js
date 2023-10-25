import { DEFAULT_PROJECTION } from '@/config'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'

/**
 * Plugin to switch to WebMercator coordinate system when we go 3D, and swap back to the default
 * projection when 2D is re-activated
 *
 * @param {Vuex.Store} store
 */
export default function from2Dto3Dplugin(store) {
    store.subscribe((mutation, state) => {
        if (DEFAULT_PROJECTION.epsg !== WEBMERCATOR.epsg && mutation.type === 'setShowIn3d') {
            if (state.ui.showIn3d) {
                store.dispatch('setProjection', WEBMERCATOR)
            } else {
                store.dispatch('setProjection', DEFAULT_PROJECTION)
            }
        }
    })
}
