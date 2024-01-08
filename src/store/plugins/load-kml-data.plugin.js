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
async function loadMetadata(store, kmlLayer) {
    log.debug(`Loading metadata for added KML layer`, kmlLayer)
    try {
        const metadata = await loadKmlMetadata(kmlLayer)
        store.dispatch('updateLayer', { id: kmlLayer.getID(), kmlMetadata: metadata })
    } catch (error) {
        log.error(`Error while fetching KML metadata for layer ${kmlLayer?.getID()}`)
    }
}

/**
 * @param {Vuex.Store} store
 * @param {KMLLayer} kmlLayer
 * @returns {Promise<void>}
 */
async function loadData(store, kmlLayer) {
    log.debug(`Loading data for added KML layer`, kmlLayer)
    try {
        const data = await loadKmlData(kmlLayer)
        store.dispatch('updateLayer', { id: kmlLayer.getID(), kmlData: data })
    } catch (error) {
        log.error(`Error while fetching KML data for layer ${kmlLayer?.getID()}`)
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
            (!mutation.payload.kmlData || !mutation.payload.kmlMetadata)
        ) {
            const kmlLayer = mutation.payload

            if (!kmlLayer.kmlData) {
                loadData(store, kmlLayer)
            }
            if (!kmlLayer.kmlMetadata) {
                loadMetadata(store, kmlLayer)
            }
        }
    })
}
