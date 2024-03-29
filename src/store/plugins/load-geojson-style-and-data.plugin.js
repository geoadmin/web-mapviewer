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
            store.dispatch('setShowLoadingBar', { loading: true, ...dispatcher })
            const { data } = await load(geoJsonLayer.geoJsonUrl)
            const layerCopy = geoJsonLayer.clone()
            layerCopy.geoJsonData = data
            // we update through the action updateLayers, so that if multiple copies of the same GeoJSON layer are present,
            // they will all be updated with the fresh data
            store.dispatch('updateLayers', {
                layers: [layerCopy],
                ...dispatcher,
            })
            store.dispatch('setShowLoadingBar', { loading: false, ...dispatcher })
            log.debug(`Data reloaded according to updateDelay for layer ${geoJsonLayer.id}`)
        } catch (error) {
            log.error(`Error while reloading GeoJSON data for layer ${geoJsonLayer.id}`, error)
            throw error
        }
    }, geoJsonLayer.updateDelay)
}

function clearAutoReload(layerId) {
    log.debug(`Removing auto-reload of data for layer ${layerId} as it was removed from the map`)
    clearInterval(intervalsByLayerId[layerId])
    delete intervalsByLayerId[layerId]
}

/**
 * @param {GeoAdminGeoJsonLayer} geoJsonLayer
 * @returns {Promise<GeoAdminGeoJsonLayer>}
 */
async function loadDataAndStyle(geoJsonLayer) {
    log.debug(`Loading data/style for added GeoJSON layer`, geoJsonLayer)
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
        return clone
    } catch (error) {
        log.error(`Error while fetching GeoJSON data/style for layer ${geoJsonLayer?.id}`, error)
        clone.isLoading = false
        clone.errorKey = 'loading_error_network_failure'
        clone.hasError = true
        return clone
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
        const addLayersSubscriber = async (layers) => {
            const geoJsonLayers = layers
                .filter((layer) => layer instanceof GeoAdminGeoJsonLayer)
                // filtering out multiple active layer entries for the same GeoJSON data
                // (only one request to get the data is necessary for all entries)
                .filter(
                    (geoJsonLayer, index, self) =>
                        // checking that the index of the first layer matching our ID is the same index as the layer
                        // we are currently looping through, filtering it out otherwise (it's a duplicate)
                        self.indexOf(self.find((layer) => layer.id === geoJsonLayer.id)) === index
                )

            store.dispatch('setShowLoadingBar', { loading: true, ...dispatcher })
            const updatedLayers = await Promise.all(
                geoJsonLayers
                    .filter((layer) => layer.isLoading)
                    .map((layer) => loadDataAndStyle(layer))
            )
            if (updatedLayers.length > 0) {
                store.dispatch('updateLayers', { layers: updatedLayers, ...dispatcher })
            }
            store.dispatch('setShowLoadingBar', { loading: false, ...dispatcher })

            // after the initial load is done,
            // going through all layers that have an update delay and launching the routine to reload their data
            geoJsonLayers
                .filter((layer) => layer.updateDelay > 0)
                .forEach((layer) => {
                    log.debug('starting auto-reload of data for layer', layer)
                    autoReloadData(store, layer)
                })
        }
        if (mutation.type === 'addLayer') {
            addLayersSubscriber([mutation.payload.layer])
        }
        if (mutation.type === 'setLayers') {
            addLayersSubscriber(mutation.payload.layers)
        }
        if (mutation.type === 'removeLayerWithId' && intervalsByLayerId[mutation.payload.layerId]) {
            // when a layer is removed, if a matching interval is found, we clear it
            clearAutoReload(mutation.payload.layerId)
        }
        if (mutation.type === 'removeLayerByIndex') {
            // As we come after the work has been done,
            // we cannot get the layer ID removed from the store from the mutation's payload.
            // So we instead go through all intervals, and clear any that has no matching layer in the active layers
            Object.keys(intervalsByLayerId)
                .filter(
                    (layerId) =>
                        !store.state.layers.activeLayers.some((layer) => layer.id === layerId)
                )
                .forEach((layerId) => clearAutoReload(layerId))
        }
    })
}
