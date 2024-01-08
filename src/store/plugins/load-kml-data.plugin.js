/**
 * Listen to the `addLayer` mutation, and if a KML is added without data/metadata defined, we load
 * it here
 */

import { loadKmlData, loadKmlMetadata } from '@/api/files.api'
import KMLLayer from '@/api/layers/KMLLayer.class'
import log from '@/utils/logging'

/**
 * @param {Vuex.Store} store
 * @param {KMLLayer} kmlLayer
 * @returns {Promise<void>}
 */
async function loadDataAndMetadata(store, kmlLayer) {
    try {
        const layerCopy = kmlLayer.clone()
        if (!kmlLayer.kmlMetadata && !kmlLayer.isExternal) {
            layerCopy.kmlMetadata = await loadKmlMetadata(layerCopy)
        }
        if (!kmlLayer.kmlData) {
            layerCopy.kmlData = await loadKmlData(layerCopy)
        }
        layerCopy.isLoading = false
        store.dispatch('updateLayer', layerCopy)
    } catch (error) {
        log.error(`Error while fetching KML data/metadata for layer ${kmlLayer?.getID()}`, error)
        throw error
    }
}

/**
 * Load KML data and metadata whenever a KML layer is added (or does nothing if the layer was
 * already processed/loaded)
 *
 * @param {Vuex.Store} store
 */
export default function loadKmlDataAndMetadata(store) {
    store.subscribe((mutation) => {
        if (
            mutation.type === 'addLayer' &&
            mutation.payload instanceof KMLLayer &&
            mutation.payload.isLoading
        ) {
            log.debug(`Loading data/metadata for added KML layer`, mutation.payload)
            loadDataAndMetadata(store, mutation.payload)
        }
    })
}
