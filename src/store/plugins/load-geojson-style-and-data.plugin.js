/**
 * Listen to the `addLayer` mutation, and if a GeoJSON is added without data/style defined, we load
 * it here
 */

import axios from 'axios'

import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'load-geojson-style-and-data.plugin' }

const intervalsByLayerId = {}

async function load(url) {
    try {
        return await axios.get(url)
    } catch (error) {
        log.error(`Error while loading URL ${url}`, error)
        throw error
    }
}

async function autoReloadData(store, geoJsonLayer) {
    if (!geoJsonLayer.updateDelay) {
        return
    }
    // clearing any pre-existing interval for this layer
    if (intervalsByLayerId[geoJsonLayer.id]) {
        clearInterval(intervalsByLayerId[geoJsonLayer.id])
    }
    log.debug(
        `Adding auto-reload of data for layer ${geoJsonLayer.id} according to its updateDelay`,
        geoJsonLayer
    )
    // creating the new interval to reload this layer's data
    intervalsByLayerId[geoJsonLayer.id] = setInterval(async () => {
        try {
            const { data } = await load(geoJsonLayer.geoJsonUrl)
            const layerCopy = geoJsonLayer.clone()
            layerCopy.geoJsonData = data
            await store.dispatch('updateLayer', {
                layer: layerCopy,
                ...dispatcher,
            })
            log.debug(`Data reloaded according to updateDelay for layer ${geoJsonLayer.id}`)
        } catch (error) {
            log.error(`Error while reloading GeoJSON data for layer ${geoJsonLayer.id}`, error)
            throw error
        }
    }, geoJsonLayer.updateDelay)
}

/**
 * @param {GeoAdminGeoJsonLayer} geoJsonLayer
 * @returns {Promise<GeoAdminGeoJsonLayer>}
 */
async function loadDataAndStyle(store, geoJsonLayer) {
    const clone = geoJsonLayer.clone()
    try {
        const [{ data: style }, { data }] = await Promise.all([
            load(geoJsonLayer.styleUrl),
            load(geoJsonLayer.geoJsonUrl),
        ])

        // as the layer comes from the store (99.9% chances), we copy it before altering it
        // (otherwise, Vuex raises an error)
        clone.geoJsonData = data
        clone.geoJsonStyle = style
        clone.isLoading = false
        await store.dispatch('updateLayer', {
            layer: clone,
            ...dispatcher,
        })
    } catch (error) {
        log.error(`Error while fetching GeoJSON data/style for layer ${geoJsonLayer?.id}`, error)
        clone.isLoading = false
        clone.errorKey = 'loading_error_network_failure'
        clone.hasError = true
        await store.dispatch('updateLayer', {
            layer: clone,
            ...dispatcher,
        })
    }
}

/**
 * Load GeoJSON data and style whenever a GeoJSON layer is added (or does nothing if the layer was
 * already processed/loaded)
 *
 * @param {Vuex.Store} store
 */
export default function loadGeojsonStyleAndData(store) {
    store.subscribe((mutation) => {
        const addLayersSubscriber = (layers) => {
            layers
                .filter((layer) => layer instanceof GeoAdminGeoJsonLayer)
                .forEach((layer) => {
                    if (layer.isLoading) {
                        log.debug(`Loading data/style for added GeoJSON layer`, layer)
                        loadDataAndStyle(store, layer)
                    }
                    if (layer.updateDelay > 0) {
                        log.debug('starting auto-reload of data for layer', layer)
                        autoReloadData(store, layer)
                    }
                })
        }
        if (mutation.type === 'addLayer') {
            addLayersSubscriber([mutation.payload.layer])
        }
        if (mutation.type === 'setLayers') {
            addLayersSubscriber(mutation.payload.layers)
        }
        if (mutation.type === 'removeLayerWithId' && intervalsByLayerId[mutation.payload.layerId]) {
            log.debug(
                `Removing auto-reload of data for layer ${mutation.payload.layerId} as it was removed from the map`
            )
            // when a layer is removed, if a matching interval is found, we clear it
            clearInterval(intervalsByLayerId[mutation.payload.layerId])
            delete intervalsByLayerId[mutation.payload.layerId]
        }
    })
}
