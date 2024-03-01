import { DEFAULT_PROJECTION } from '@/config'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'

export const backgroundMatriceBetween2dAnd3d = {
    'ch.swisstopo.pixelkarte-farbe': 'ch.swisstopo.swisstlm3d-karte-farbe_3d',
    'ch.swisstopo.pixelkarte-grau': 'ch.swisstopo.swisstlm3d-karte-grau_3d',
    'ch.swisstopo.swissimage': 'ch.swisstopo.swissimage_3d',
}

const dispatcher = { dispatcher: '2d-to-3d-management.plugin' }

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
                        return layerId3d === state.layers.currentBackgroundLayer?.id
                    })
                    if (matching2dBackgroundId?.length > 0) {
                        store.dispatch('setBackground', {
                            bgLayer: matching2dBackgroundId[0],
                            ...dispatcher,
                        })
                    }
                } else if (state.layers.currentBackgroundLayer) {
                    // when going 3D, as we are before the action
                    const matching3dBackgroundId =
                        backgroundMatriceBetween2dAnd3d[state.layers.currentBackgroundLayer.id]
                    if (matching3dBackgroundId) {
                        store.dispatch('setBackground', {
                            bgLayer: matching3dBackgroundId,
                            ...dispatcher,
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
                            projection: WEBMERCATOR,
                            ...dispatcher,
                        })
                    } else {
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
