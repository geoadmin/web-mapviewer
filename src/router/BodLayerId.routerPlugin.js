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
 * @param {any} query The string containing the parameters
 * @param {layersConfig} layersConfig The store layers configuration
 * @returns {Object | undefined} Either an object with the layer, its highlighted features IDS and
 *   the showtooltip parameter if it was set
 */
function parseBodLayerParamsFromQuery(query, layersConfig) {
    if (!query) {
        return undefined
    }
    // we remove everything until the 'map?', so we are sure we've got
    // the query parameters
    const urlParams = new URLSearchParams(
        decodeURIComponent(query.slice(query.indexOf('map?') + 3))
    )
    const nonStandardParamsPresence = Array.from(urlParams.keys()).some(
        (param) => !standardsParams.includes(param)
    )
    // if all parameters are standard, we do not need to be here
    if (!nonStandardParamsPresence) {
        return undefined
    }
    const val = {}
    urlParams.forEach((value, key) => {
        let layer = null
        if (!standardsParams.includes(key)) {
            layer = layersConfig.find((layer) => layer.getID() === key)
        }
        if (layer) {
            const clonedLayer = layer.clone()
            clonedLayer.visibility = true
            val.layer = clonedLayer
            val.features = value.split(',')
            // for the showToolTip parameter : if it's null, undefined, or true, it should be true
            val.showToolTip = !(urlParams.get('showtooltip') === false)
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
    delete newQuery.showToolTip
    // the center parameter is always overwritten
    delete newQuery.center
    // A WORD OF WARNING :
    // this checks if the query has changed or not at all, as a way to avoid infinites
    // this check is quick and easy, but will fail if the parameters order change.
    // If at some point we have this issue, we'll need to make a deeper equality check.
    if (JSON.stringify(to.query) === JSON.stringify(newQuery)) {
        next()
    }
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
        const coordinates = []
        features.forEach((feature) => {
            coordinates.push(feature.coordinates[0])
        })
        const extent = []

        extent[0] = [
            Math.min(coordinates[0][0], coordinates[1][0], coordinates[2][0], coordinates[3][0]),
            Math.min(coordinates[0][1], coordinates[1][1], coordinates[2][1], coordinates[3][1]),
        ]
        extent[1] = [
            Math.max(coordinates[0][0], coordinates[1][0], coordinates[2][0], coordinates[3][0]),
            Math.max(coordinates[0][1], coordinates[1][1], coordinates[2][1], coordinates[3][1]),
        ]
        if (needToZoom) {
            store.dispatch('zoomToExtent', extent)
        } else {
            const center = [
                Math.round([extent[0][0] + extent[1][0] / 2]),
                Math.round([extent[0][1] + extent[1][1] / 2]),
            ]
            store.dispatch('setCenter', {
                center: center,
                source: 'Bod Layer Id router',
            })
        }
    }

    if (!bodIdParams.showToolTip) {
        store.dispatch('hideLocationPopup')
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

// TO DO : solve infinite issue. Either by ensuring we go through it only once, or that those bodIdParams are set to something we can work with
const bodLayerIdRouterPlugin = (router, store) => {
    let changesMadeByThisPlugin = false
    router.beforeEach((to, from, next) => {
        /**
         * We need to ensure the startup is finished to handle the bod layer Id, as we need some
         * data to be defined (most importantly : the layers config)
         */

        if (to.name === 'MapView') {
            if (!changesMadeByThisPlugin) {
                const bodIdParams = window.location?.hash
                    ? parseBodLayerParamsFromQuery(window.location.hash, store.state.layers.config)
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
