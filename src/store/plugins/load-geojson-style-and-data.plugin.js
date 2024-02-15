/**
 * Listen to the `addLayer` mutation, and if a GeoJSON is added without data/style defined, we load
 * it here
 */

import axios from 'axios'

import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import log from '@/utils/logging'

async function load(url) {
    try {
        return await axios.get(url)
    } catch (error) {
        log.error(`Error while loading URL ${url}`, error)
        throw error
    }
}

/**
 * @param {Vuex.Store} store
 * @param {GeoAdminGeoJsonLayer} geoJsonLayer
 * @returns {Promise<void>}
 */
async function loadDataAndStyle(store, geoJsonLayer) {
    try {
        const { data: style } = await load(geoJsonLayer.styleUrl)
        const { data } = await load(geoJsonLayer.geoJsonUrl)
        // as the layer comes from the store (99.9% chances), we copy it before altering it
        // (otherwise, Vuex raises an error)
        const layerCopy = geoJsonLayer.clone()
        layerCopy.geoJsonData = data
        layerCopy.geoJsonStyle = style
        layerCopy.isLoading = false
        store.dispatch('updateLayer', layerCopy)
    } catch (error) {
        log.error(
            `Error while fetching GeoJSON data/style for layer ${geoJsonLayer?.getID()}`,
            error
        )
        throw error
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
        if (
            mutation.type === 'addLayer' &&
            mutation.payload.layer instanceof GeoAdminGeoJsonLayer &&
            mutation.payload.layer?.isLoading
        ) {
            log.debug(`Loading data/style for added GeoJSON layer`, mutation.payload)
            loadDataAndStyle(store, mutation.payload.layer)
        }
    })
}
