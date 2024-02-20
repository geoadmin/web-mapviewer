import getFeature from '@/api/features.api'
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

/**
 * Check the query for potential layers ids parameters.
 *
 * @param {Object} query The to.query object
 * @param {layersConfig} layersConfig The store layers configuration
 * @returns {Object | undefined} Either an object with the layer, its highlighted features IDS and
 *   the showtooltip parameter if it was set
 */
function parseBodLayerParamsFromQuery(query, layersConfig) {
    if (!query) {
        return undefined
    }
    const nonStandardParamsPresence = Array.from(Object.keys(query)).some(
        (param) => !standardsParams.includes(param)
    )
    // if all parameters are standard, we do not need to be here
    if (!nonStandardParamsPresence) {
        return undefined
    }
    const val = {}
    Object.entries(query).forEach(([key, value]) => {
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
            return null // we get out at the first instance of a bod layer id found
        }
    })
    // if we found no layer, we return undefined
    return val?.layer ? val : undefined
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
function handleBodIdParams(bodIdParams, store, to, next) {
    const newQuery = { ...to.query }
    // QUESTION TO pascal : do we allow the bod layer id param to have the same parameters as the other layers ?
    // in my opinion : no, because it's simpler, but it might be done

    if (newQuery.layers?.includes(bodIdParams.layer.getID())) {
        const regex = new RegExp(bodIdParams.layer.getID() + ',[a-zA-Z]+')
        // this will replace the `{layer-id},{visibility}` parameter by `{layer-id},`
        // forcing the layer to be visible
        newQuery.layers = newQuery.layers.replace(regex, `${bodIdParams.layer.getID()},`)
    } else {
        // the parameter given was not part of the layers, or there was no active layers
        newQuery.layers = `${
            newQuery.layers ? newQuery.layers + ';' : ''
        }${bodIdParams.layer.getID()}`
    }
    delete newQuery[bodIdParams.layer.getID()]
    delete newQuery.showtooltip
    // the center parameter is always overwritten
    delete newQuery.center

    retrieveAndDispatchFeaturesToStore(bodIdParams, !newQuery.z, store)

    next({
        name: 'MapView',
        query: newQuery,
    })
}

/**
 * @param {Object} bodIdParams Object containing the layer, its highlighted features and a boolean
 *   telling us wether we should show their tooltip or not
 * @param {Store} store The store
 */
async function retrieveAndDispatchFeaturesToStore(bodIdParams, needToZoom, store) {
    const featureRequests = []
    await bodIdParams.features.forEach((featureID) => {
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
    const features = []
    await Promise.all(featureRequests)
        .then((values) => {
            values.forEach((value) => {
                features.push(value)
            })
        })
        .catch((error) => {
            log.error("Wasn't able to get features", error)
        })
    if (features.length > 0) {
        store.dispatch('setSelectedFeatures', features)
        const coordinatesX = []
        const coordinatesY = []
        features.forEach((feature) => {
            coordinatesX.push(feature.coordinates[0][0])
            coordinatesY.push(feature.coordinates[0][1])
        })
        const extent = []
        extent[0] = [Math.min(...coordinatesX), Math.min(...coordinatesY)]
        extent[1] = [Math.max(...coordinatesX), Math.max(...coordinatesY)]

        const center = [
            Math.round([(extent[0][0] + extent[1][0]) / 2]),
            Math.round([(extent[0][1] + extent[1][1]) / 2]),
        ]

        if (needToZoom) {
            // In old mapviewer, when there was only one feature we set the zoom level to 8
            // some icons don't have content at certain zoom level
            // so rather than use the zoomToExtent function, we get its logic and
            // use it to calculate the max zoom, and we get 8 if it would zoom further
            const zoom = Math.min(getZoomFromExtent(extent, center, store), 8)

            store.dispatch('setZoom', { zoom: zoom, source: 'Bod Layer Id router' })
        }
        store.dispatch('setCenter', {
            center: center,
            source: 'Bod Layer Id router',
        })
    }
    if (!bodIdParams.showToolTip) {
        // we'll need to see how to do this better, as this doesn't  work
        store.dispatch('hideLocationPopup') // this is apparently not the right thing to show
    }
}

function getZoomFromExtent(extent, center, store) {
    const extentSize = {
        width: Math.abs(extent[1][0] - extent[0][0]),
        height: Math.abs(extent[1][1] - extent[0][1]),
    }
    let targetResolution
    // if the extent's height is greater than width, we base our resolution calculation on that
    if (extentSize.height > extentSize.width) {
        targetResolution = extentSize.height / (store.state.ui.height - 96) /* header height */
    } else {
        targetResolution = extentSize.width / store.state.ui.width
    }

    const zoomForResolution = store.state.position.projection.getZoomForResolutionAndCenter(
        targetResolution,
        center
    )

    return Math.max(zoomForResolution - 1, 0)
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
    let changesMadeByThisPlugin = false
    router.beforeEach((to, from, next) => {
        /**
         * We need to ensure the startup is finished to handle the bod layer Id, as we need some
         * data to be defined (most importantly : the layers config)
         */

        if (to.name === 'MapView') {
            if (!changesMadeByThisPlugin) {
                // maybe use to.query instead of window.location.hash
                const bodIdParams = window.location?.hash
                    ? parseBodLayerParamsFromQuery(to.query, store.state.layers.config)
                    : null
                if (bodIdParams?.layer) {
                    changesMadeByThisPlugin = true
                    handleBodIdParams(bodIdParams, store, to, next)
                } else {
                    next()
                }
            } else {
                changesMadeByThisPlugin = false
                next()
            }
        } else {
            changesMadeByThisPlugin = false
            next()
        }
    })
}

export default bodLayerIdRouterPlugin
