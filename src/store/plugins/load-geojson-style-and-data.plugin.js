/**
 * Listen to the `addLayer` mutation, and if a GeoJSON is added without data/style defined, we load
 * it here
 */

import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import log from '@/utils/logging'
import axios from 'axios'

function loadStyle(geoJsonLayer) {
    return new Promise((resolve, reject) => {
        axios
            .get(geoJsonLayer.styleUrl)
            .then((response) => response.data)
            .then((style) => {
                resolve(style)
            })
            .catch((error) => {
                log.error(
                    `Error while loading GeoJSON style for layer ${geoJsonLayer.getID()}`,
                    error
                )
                reject(error)
            })
    })
}

function loadData(geoJsonLayer) {
    return new Promise((resolve, reject) => {
        axios
            .get(geoJsonLayer.geoJsonUrl)
            .then((response) => response.data)
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                log.error(
                    `Error while fetching GeoJSON data for layer ${geoJsonLayer.getID()}`,
                    error
                )
                reject(error)
            })
    })
}

/**
 * @param {Vuex.Store} store
 * @param {GeoAdminGeoJsonLayer} geoJsonLayer
 * @returns {Promise<void>}
 */
function loadDataAndStyle(store, geoJsonLayer) {
    Promise.all([loadStyle(geoJsonLayer), loadData(geoJsonLayer)])
        .then(([style, data]) => {
            // as the layer comes from the store (99.9% chances), we copy it before altering it
            // (otherwise, Vuex raises an error)
            const layerCopy = geoJsonLayer.clone()
            layerCopy.geoJsonData = data
            layerCopy.geoJsonStyle = style
            layerCopy.isLoading = false
            store.dispatch('updateLayer', layerCopy)
        })
        .catch((error) => {
            log.error(
                `Error while fetching GeoJSON data/style for layer ${geoJsonLayer?.getID()}`,
                error
            )
        })
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
            mutation.payload.layer.isLoading
        ) {
            log.debug(`Loading data/style for added GeoJSON layer`, mutation.payload.layer)
            loadDataAndStyle(store, mutation.payload.layer)
        }
    })
}
