import { DEFAULT_PROJECTION } from '@/config'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'

export const backgroundMatriceBetween2dAnd3d = {
    'ch.swisstopo.pixelkarte-farbe': 'ch.swisstopo.swisstlm3d-karte-farbe_3d',
    'ch.swisstopo.pixelkarte-grau': 'ch.swisstopo.swisstlm3d-karte-grau_3d',
    'ch.swisstopo.swissimage': 'ch.swisstopo.swissimage_3d',
}

const STORE_DISPATCHER_2D_3D_PLUGIN = '2d-to-3d-management.plugin'

/**
 * Plugin to switch to WebMercator coordinate system when we go 3D, and swap back to the default
 * projection when 2D is re-activated
 *
 * @param {Vuex.Store} store
 */
export default function from2Dto3Dplugin(store) {
    store.subscribeAction({
        before: (action, state) => {
            if (action.type === 'set3dActive') {
                if (state.cesium.active) {
                    // when going 2D, as we are before the action
                    const matching2dBackgroundId = Object.entries(
                        backgroundMatriceBetween2dAnd3d
                    ).find(([_, layerId3d]) => {
                        return layerId3d === state.layers.currentBackgroundLayer?.getID()
                    })
                    if (matching2dBackgroundId?.length > 0) {
                        store.dispatch('setBackground', {
                            value: matching2dBackgroundId[0],
                            dispatcher: STORE_DISPATCHER_2D_3D_PLUGIN,
                        })
                    }
                } else if (state.layers.currentBackgroundLayer) {
                    // when going 3D, as we are before the action
                    const matching3dBackgroundId =
                        backgroundMatriceBetween2dAnd3d[state.layers.currentBackgroundLayer.getID()]
                    if (matching3dBackgroundId) {
                        store.dispatch('setBackground', {
                            value: matching3dBackgroundId,
                            dispatcher: STORE_DISPATCHER_2D_3D_PLUGIN,
                        })
                    }
                }
            }
        },
        after: (action, state) => {
            if (action.type === 'set3dActive') {
                if (DEFAULT_PROJECTION.epsg !== WEBMERCATOR.epsg) {
                    if (state.cesium.active) {
                        store.dispatch('setProjection', {
                            value: WEBMERCATOR,
                            dispatcher: STORE_DISPATCHER_2D_3D_PLUGIN,
                        })
                    } else {
                        store.dispatch('setProjection', {
                            value: DEFAULT_PROJECTION,
                            dispatcher: STORE_DISPATCHER_2D_3D_PLUGIN,
                        })
                    }
                }
            }
        },
    })
}
