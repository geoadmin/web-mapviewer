/**
 * Listen to the `addLayer` mutation, and if a GeoJSON is added without data/style defined, we load
 * it here
 */

import axios from 'axios'

import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'load-geojson-style-and-data.plugin' }

async function load(url) {
    try {
        return await axios.get(url)
    } catch (error) {
        log.error(`Error while loading URL ${url}`, error)
        throw error
    }
}

/**
 * @param {GeoAdminGeoJsonLayer} geoJsonLayer
 * @returns {Promise<GeoAdminGeoJsonLayer>}
 */
async function loadDataAndStyle(geoJsonLayer) {
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
            const updatedLayers = await layers
                .filter((layer) => layer instanceof GeoAdminGeoJsonLayer && layer.isLoading)
                .map((layer) => {
                    log.debug(`Loading data/style for added GeoJSON layer`, layer)
                    return loadDataAndStyle(store, layer)
                })
            store.dispatch('updateLayers', { layers: updatedLayers, ...dispatcher })
        }
        if (mutation.type === 'addLayer') {
            addLayersSubscriber([mutation.payload.layer])
        }
        if (mutation.type === 'setLayers') {
            addLayersSubscriber(mutation.payload.layers)
        }
    })
}
