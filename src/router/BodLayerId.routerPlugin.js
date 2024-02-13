import storeSyncConfig from './storeSync/storeSync.config'

const standardsParams = storeSyncConfig.map((param) => {
    return param.urlParamName
})
standardsParams.push('showToolTip')
standardsParams.push('redirect')
function parseBodLayerParamsFromQuery(query, layersConfig) {
    console.log(query)
    if (!query) {
        return undefined
    }
    // we remove everything until the question mark
    const urlParams = new URLSearchParams(
        decodeURIComponent(query.slice(query.indexOf('map?') + 3))
    )
    console.log(urlParams)
    // This will be set to True if all params given are standard parameters
    const noExtraParams = Array.from(urlParams.keys()).every((param) =>
        standardsParams.includes(param)
    )
    if (noExtraParams) {
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
            val.features = value
            val.showToolTip = !urlParams.get('showToolTip') // should be true by default
            return null // we get out at the first instance of a bod layer id found
        }
    })

    return val.layer ? val : undefined
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
    // QUESTION TO pascal : do we allow the bod layer id param to have the same parameters as the other layers ?
    // in my opinion : no
    if (newQuery.layers?.includes(bodIdParams.layer?.getID())) {
        const regex = new RegExp(bodIdParams.layer?.getID() + ',[a-zA-Z]+')
        // this will replace the `{layer-id},{visibility}` parameter by `{layer-id},`
        // forcing the layer to be visible
        newQuery.layers = newQuery.layers.replace(regex, `${bodIdParams.layer?.getID()},`)
    } else {
        // the parameter given was not part of the layers, or there was no active layers
        newQuery.layers = `${
            newQuery.layers ? newQuery.layers + ';' : ''
        }${bodIdParams.layer?.getID()}`
    }
    delete newQuery[bodIdParams.layer?.getID()]
    delete newQuery?.showToolTip
    //dispatchBodIdParamsToStore(bodIdParams, store)

    next({
        name: 'MapView',
        query: newQuery,
    })
}

async function dispatchBodIdParamsToStore(bodIdParams, store) {
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
    let isFirstRequest = true
    router.beforeEach((to, from, next) => {
        /**
         * We need to ensure the startup is finished to handle the bod layer Id, as we need some
         * data to be defined (most importantly : the layers config)
         */
        if (to.name === 'MapView' && isFirstRequest) {
            const bodIdParams = window.location?.hash
                ? parseBodLayerParamsFromQuery(window.location.hash, store.state.layers.config)
                : null
            isFirstRequest = false
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
