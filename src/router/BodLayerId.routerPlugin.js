import getFeature from '@/api/features/features.api'
import log from '@/utils/logging'

import storeSyncConfig from './storeSync/storeSync.config'

// this will include all parameters that are part of the store sync config,
// meaning we'll automatically ignore any new param created.
const standardsParams = storeSyncConfig.map((param) => {
    return param.urlParamName
})
// Here we add params that can be part of the query but not within the standard
// parameters. A comment explaining why it's not a standard URL parameter could
// be a good idea.

// showtooltip is only used in conjunction with the bod-layer-id params, which
// means we handle it here with the bod-layer-id params and ignore it in any
// other case.
standardsParams.push('showtooltip')

const STORE_DISPATCHER_BOD_LAYER_ID_ROUTER_PLUGIN = 'BodLayerId.routerPlugin.js'

/**
 * Check the query for potential layers ids parameters.
 *
 * @param {Object} query The to.query object
 * @param {layersConfig} layersConfig The store layers configuration
 * @returns {Object | null} Either an object with the layer, its highlighted features IDS and the
 *   showtooltip parameter if it was set
 */
function parseBodLayerParamsFromQuery(query, layersConfig) {
    if (!query) {
        return null
    }
    const nonStandardParamsPresence = Array.from(Object.keys(query)).some(
        (param) => !standardsParams.includes(param)
    )
    // if all parameters are standard, we do not need to be here
    if (!nonStandardParamsPresence) {
        return null
    }
    const val = {}
    const queryItems = Object.entries(query)
    for (let i = 0; i < queryItems.length; i++) {
        const key = queryItems[i][0]
        const value = queryItems[i][1]
        let layer = null
        if (!standardsParams.includes(key)) {
            layer = layersConfig.find((layer) => layer.getID() === key)
        }
        if (layer) {
            const clonedLayer = layer.clone()
            clonedLayer.visibility = true
            val.layer = clonedLayer
            val.features = value.split(',')
            // for the showToolTip parameter : it should be false only when specified as false
            val.showToolTip = !(query.showtooltip === 'false' || query.showtooltip === false)
            break
        }
    }

    // if we found no layer, we return null
    return val?.layer ? val : null
}
/**
 * Checks the layers param in the URL and either ensure an already activated layer is visible, or
 * add the layer in `bodIdParams.layer` to the layers param. It also dispatch the highlighted
 * features to the store.
 *
 * If there is no layers params, this means the only active layer will be the bod Id layer given
 *
 * @param {Object} bodIdParams All the bod-layer-id parameters needed
 * @param {Store} store
 * @param {any} to
 * @param {any} next
 */
function handleBodIdParams(bodIdParams, store, to) {
    const newQuery = { ...to.query }

    const activeLayersIds = []
    if (!to.query.layers) {
        // ensuring the default layers have not been populated if the parameter is not set
        store.dispatch('clearLayers', { dispatcher: STORE_DISPATCHER_BOD_LAYER_ID_ROUTER_PLUGIN })
    }
    store.state.layers.activeLayers.forEach((layer) => {
        activeLayersIds.push(layer.getID())
    })
    if (!activeLayersIds.includes(bodIdParams.layer.getID())) {
        store.dispatch('addLayer', {
            layer: bodIdParams.layer,
            dispatcher: STORE_DISPATCHER_BOD_LAYER_ID_ROUTER_PLUGIN,
        })
    }
    delete newQuery[bodIdParams.layer.getID()]
    delete newQuery.showtooltip
    delete newQuery.center

    retrieveAndDispatchFeaturesToStore(bodIdParams, !newQuery.z, store)
    return {
        name: 'MapView',
        query: { redirect: newQuery },
    }
}

/**
 * Add the features to the selected features. Finally, center the camera and adjust the zoom if
 * needed.
 *
 * @param {Object} bodIdParams Object containing the layer, its highlighted features and a boolean
 *   telling us wether we should show their tooltip or not
 * @param {Store} store The store
 */
async function retrieveAndDispatchFeaturesToStore(bodIdParams, needToZoom, store) {
    // Step 1 : adding the features to the selected features
    const featureRequests = []
    bodIdParams.features.forEach((featureID) => {
        featureRequests.push(
            getFeature(
                bodIdParams.layer,
                featureID,
                store.state.position.projection,
                store.state.i18n.lang,
                bodIdParams.showToolTip
            )
        )
    })
    try {
        const features = await Promise.all(featureRequests)
        if (features.length > 0) {
            store.dispatch('setSelectedFeatures', features)
            const coordinatesX = []
            const coordinatesY = []
            // Step 2 : centering on all features and calculating the zoom level if necessary
            features.forEach((feature) => {
                coordinatesX.push(feature.coordinates[0][0])
                coordinatesY.push(feature.coordinates[0][1])
            })
            const extent = []
            extent[0] = [Math.min(...coordinatesX), Math.min(...coordinatesY)]
            extent[1] = [Math.max(...coordinatesX), Math.max(...coordinatesY)]

            const center = [
                coordinatesX.reduce((a, b) => a + b, 0) / coordinatesX.length,
                coordinatesX.reduce((a, b) => a + b, 0) / coordinatesX.length,
            ]

            if (needToZoom) {
                // In old mapviewer, when there was only one feature we set the zoom level to 8
                // some icons don't have content at certain zoom level
                store.dispatch('zoomToExtent', {
                    extent: extent,
                    maxZoomLevel: 8,
                    dispatcher: STORE_DISPATCHER_BOD_LAYER_ID_ROUTER_PLUGIN,
                })
            } else {
                store.dispatch('setCenter', {
                    center: center,
                    source: 'Bod Layer Id router',
                    dispatcher: STORE_DISPATCHER_BOD_LAYER_ID_ROUTER_PLUGIN,
                })
            }
        }
    } catch (error) {
        log.error(`Error while processing features in bod-layer-id router. error is ${error}`)
    }
    // Step 3 : hide the tooltip if needed
    if (!bodIdParams.showToolTip) {
        // TO DO : discuss with pascal, brice, maybe Jürge / Stefan / Chris to see what showtooltip is supposed to do
        store.dispatch('hideToolTip', STORE_DISPATCHER_BOD_LAYER_ID_ROUTER_PLUGIN)
    }
}

/**
 * Parse the URL for bod-layer-id parameters (with or without the showToolTip parameter), remove the
 * parameter for the URL while dispatching what is needed to the store
 *
 * Example:
 *
 * - `http://localhost:8080/#/?geolocation=true&some.layer_id=213,234` =>
 *   `http://localhost:8080/#/?geolocation=true&layers=some.layer_id`
 *
 * @param {Router} router
 * @param {Store} store
 */

const bodLayerIdRouterPlugin = (router, store) => {
    router.beforeEach((to) => {
        if (to.name === 'MapView') {
            const bodIdParams = window.location?.hash
                ? parseBodLayerParamsFromQuery(to.query, store.state.layers.config)
                : null
            if (bodIdParams?.layer) {
                return handleBodIdParams(bodIdParams, store, to)
            }
            return undefined
        }
        return undefined
    })
}

export default bodLayerIdRouterPlugin
