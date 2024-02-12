import layersStore from '@/store/modules/layers.store'

import storeSyncConfig from './storeSync/storeSync.config'

const standardsParams = storeSyncConfig.map((param) => {
    param.urlParamName
})
standardsParams.push('showToolTip')

function parseBodLayerParamsFromQuery(query) {
    if (!query) {
        return undefined
    }
    const urlParams = new URLSearchParams(query)
    // This will be set to True if all params given are standard parameters
    const noExtraParams = urlParams.keys().every((param) => standardsParams.includes(param))
    if (noExtraParams) {
        return undefined
    }
    const layerIds = layersStore.state.config.map((layer) => layer.geoAdminID)
    const val = {}
    urlParams.forEach((value, key) => {
        if (!standardsParams.includes(key) && layerIds.includes(key)) {
            val.layer = key
            val.features = value
            val.showToolTip = !!urlParams.get('showToolTip')
            return null // we get out at the first instance of a bod layer id found
        }
    })
    return val
}

/**
 * This function checks the layers param in the URL and either ensure an already activated layer is
 * visible, or add the layer in `bodIdParams.layer` to the layers param. It also dispatch the
 * highlighted features to the store.
 *
 * @param {Object} bodIdParams All the bod-layer-id parameters needed
 * @param {Store} store
 * @param {any} to
 * @param {any} next
 */
function handleBodIdParams(bodIdParams, store, to, next) {
    const newQuery = { ...to.query }
    /* // QUESTION TO pascal : do we allow the bod layer id param to have the same parameters as the other layers ?
    // in my opinion : no
    if (newQuery.layers?.includes(bodIdParams.layer)) {
        const regex = new RegExp(bodIdParams.layer + ',[a-zA-Z]+')
        // this will replace the `{layer-id},{visibility}` parameter by `{layer-id},`
        // forcing the layer to be visible
        newQuery.layers = newQuery.layers.replace(regex, `${bodIdParams.layer},`)
    } else {
        // the parameter given was not part of the layers, or there was no active layers
        newQuery.layers = `${newQuery.layers ? newQuery.layers + ';' : ''}${bodIdParams.layer}`
    }
    */
    delete newQuery[bodIdParams.layer]
    delete newQuery?.showToolTip
    dispatchBodIdParamsToStore(bodIdParams, store)

    next({
        name: 'MapView',
        query: newQuery,
    })
}

async function dispatchBodIdParamsToStore(bodIdParams, store) {
    await store.dispatch('addLayer', { layer: bodIdParams.layer, visibility: true })
    store.dispatch('setPreSelectedFeatures', bodIdParams)
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
    const bodIdParams = window.location?.search
        ? parseBodLayerParamsFromQuery(window.location.search)
        : null
    router.beforeEach((to, from, next) => {
        /**
         * We need to ensure the startup is finished to handle the bod layer Id, as we need some
         * data to be defined (most importantly : the layers config)
         */
        if (to.name === 'MapView') {
            if (bodIdParams) {
                handleBodIdParams(bodIdParams, store, to, next)
            } else {
                next()
            }
        } else {
            next()
        }
    })
}

export default bodLayerIdRouterPlugin
